import { BadRequestException, Injectable, } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { otpServices } from "src/common/services/otp.service";
import { registerDto } from "./dto/register.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "../sessions/entity/sessions.entity";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"

import { LoginDto } from "./dto/loginDto";
import { EmailService } from "src/common/services/email.service";
import { verifyOtpDto } from "./dto/verifyotp.dto";
import { changePasswrodDto } from "./dto/changePassword.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Session)
        private sessionRepo: Repository<Session>,

        private jwtService: JwtService,
        private config: ConfigService,
        private otpService: otpServices,
        private emailService: EmailService
    ) { }

    async sendRegisterOtp(email: string) {
        const otp = await this.otpService.generateOtp()
        await this.otpService.storeOtp(email, otp)
        await this.emailService.sendOtp(email, otp)

        return {
            message: `otp sended to ${email}`
        }
    }

    async verifyRegisteredOtp(dto: verifyOtpDto) {
        const verify = await this.otpService.verifyEmail(dto.email, dto.otp)

        if (!verify) throw new BadRequestException("Invallid or expire otp")

        return {
            message: "Email is verified"
        }
    }

    async registerNewUser(dto: registerDto, ip: any, userAgent: any) {
        const validateIsVerified = await this.otpService.isVerified(dto.email)

        if (!validateIsVerified) throw new BadRequestException("You are not verified yet or you took more then 10 mins to register please try again")

        const userExists = await this.userRepo.findOne({
            where: { email: dto.email }
        })

        if (userExists) throw new BadRequestException("Already registered, Please login")

        const hashed = await bcrypt.hash(dto.password, 12)

        const user = this.userRepo.create({
            email: dto.email,
            password: hashed,
            name : dto.name,
        })

        const savedUser = await this.userRepo.save(user)
        const session = await this.sessionRepo.create({
            user: savedUser,
            ip: ip,
            userAgent: userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })

        const savedSession = await this.sessionRepo.save(session)
        const token = await this.generateTokens(savedUser.id, savedUser.email, session.id);

        savedSession.refreshToken = token.refreshToken;

        await this.sessionRepo.save(savedSession);

        const { password: _, ...result } = savedUser

        return {
            token,
            user: result
        }
    }

    async loginuser(dto: LoginDto, ip: any, userAgent: any) {
        const findUser = await this.userRepo.findOne({
            where: { email: dto.email }
        })

        if (!findUser) throw new BadRequestException("User dont exists! please register")
            console.log("This is the findUser" , findUser)
            console.log("This is the password form the postamn " , dto.password)

        const passwordVerify = await bcrypt.compare(dto.password, findUser.password)

        if (!passwordVerify) return new BadRequestException("Invallid Password")

        const session = this.sessionRepo.create({
            user: findUser,
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const savedSession = await this.sessionRepo.save(session)
        const token = await this.generateTokens(findUser.id, findUser.password, session.id)

        savedSession.refreshToken = token.refreshToken

        await this.sessionRepo.save(savedSession)

        const { password: _, ...savedUser } = findUser

        return {
            token,
            user: savedUser
        }
    }

    async forgotPasswordSendOtp(email: string) {
        const isUser = await this.userRepo.findOne({
            where: { email }
        })

        if (!isUser) throw new BadRequestException("User not found, Please register")

        const otp = await this.otpService.generateOtp()

        await this.otpService.saveOtpForForgotPassword(email, otp)

        return {
            message: `Email sent to ${email}`
        }

    }

    async verifyPassword(dto: verifyOtpDto) {
        const isVerified = this.otpService.verifyEmail(dto.email, dto.otp)

        if (!isVerified) throw new BadRequestException("Invallid Otp")

        return {
            message: "Otp vrified please change you password"
        }

    }

    async changePassword(dto: changePasswrodDto) {
        const isAuthenticated = await this.otpService.isVerifiedForPasswordChange(dto.email)

        if (!isAuthenticated) throw new BadRequestException("Process expires or Failed to change password")

        const user = await this.userRepo.findOne({
            where: { email: dto.email }
        })

        if (!user) throw new BadRequestException("Bsdk to yaha tak aaya kais")

        const hased = await bcrypt.hash(dto.password, 12)

        user.password = hased

        await this.userRepo.save(user)

    }
    async logoutUser(sessionId: string) {
        await this.sessionRepo.delete(sessionId)
    }
    async generateTokens(userId: string, email: String, sessionId: string) {
        const payload = {
            sub: userId,
            email: email,
            sessionId: sessionId
        }

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES')
        })

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES')
        })

        return {
            accessToken,
            refreshToken,
        }
    }

    async refreshToken(token: string) {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: this.config.get('JWT_REFRESH_SECRET')
        })

        if (!payload) throw new BadRequestException("Invalid token access denied, Login Again")

        return this.generateTokens(payload.sub, payload.email, payload.sessionId)
    }


}