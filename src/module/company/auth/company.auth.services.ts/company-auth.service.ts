// company-auth.service.ts
import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

import { Company } from "../../companies/entity/company.entity";
import { CompanySignupDto } from "../dto/company-signup.dto";
import { CompanyLoginDto } from "../dto/company-login.dto";
import { otpServices } from "src/common/services/otp.service";
import { EmailService } from "src/common/services/email.service";
import { Session } from "src/module/sessions/entity/sessions.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CompanyAuthService {

    constructor(
        @InjectRepository(Company)
        private companyRepo: Repository<Company>,

        @InjectRepository(Session)
        private sessionsRepo: Repository<Session>,
        private jwtService: JwtService,
        private otpService: otpServices,
        private emailService: EmailService,
        private config: ConfigService
    ) { }

    async sendOtp(email: string) {

        const canSend = await this.otpService.canRequestOtp(email);

        if (!canSend) {
            throw new ConflictException("OTP already sent. Try later.");
        }

        const otp = this.otpService.generateOtp();

        await this.otpService.storeOtp(email, otp);
        await this.emailService.sendOtp(email, otp);

        return { message: "OTP sent successfully" };
    }

    async verifyOtp(email: string, otp: string) {

        const isValid = await this.otpService.verifyEmail(email, otp);

        if (!isValid) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        return { message: "OTP verified successfully" };
    }


    async signup(dto: CompanySignupDto, ip: string, userAgent: string) {
        const isVerified = await this.otpService.isVerified(dto.email);

        if (!isVerified) {
            throw new UnauthorizedException("Email not verified");
        }

        const existing = await this.companyRepo.findOne({
            where: { email: dto.email }
        });

        if (existing) {
            throw new ConflictException("Company already exists");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const company = this.companyRepo.create({
            ...dto,
            password: hashedPassword
        });

        const savedCompany = await this.companyRepo.save(company);


        const session = this.sessionsRepo.create({
            company: savedCompany,
            type: "COMPANY",
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const savedSession = await this.sessionsRepo.save(session);


        const token = await this.generateTokens(
            savedCompany.id,
            savedCompany.email,
            savedSession.id
        );

        savedSession.refreshToken = token.refreshToken;
        await this.sessionsRepo.save(savedSession);

        const { password, ...result } = savedCompany;

        return {
            token,
            company: result
        };
    }

    //  LOGIN
    async login(dto: CompanyLoginDto, ip: string, userAgent: string) {

        const company = await this.companyRepo.findOne({
            where: { email: dto.email }
        });

        if (!company) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(dto.password, company.password);

        if (!isMatch) {
            throw new UnauthorizedException("Invalid credentials");
        }


        const session = this.sessionsRepo.create({
            company,
            type: "COMPANY",
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const savedSession = await this.sessionsRepo.save(session);


        const token = await this.generateTokens(
            company.id,
            company.email,
            savedSession.id
        );


        savedSession.refreshToken = token.refreshToken;
        await this.sessionsRepo.save(savedSession);


        const { password, ...result } = company;

        return {
            token,
            company: result
        };
    }

    async refreshToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            if (!payload) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            // 🔥 Check session exists
            const session = await this.sessionsRepo.findOne({
                where: { id: payload.sessionId },
                relations: ["company"],
            });

            if (!session) {
                throw new UnauthorizedException("Session not found");
            }

            // 🔥 Check token matches DB (VERY IMPORTANT)
            if (session.refreshToken !== token) {
                throw new UnauthorizedException("Token mismatch (possible theft)");
            }

            // 🔥 Check expiration
            if (session.expiresAt < new Date()) {
                throw new UnauthorizedException("Session expired");
            }

            // 🔥 Generate new tokens (ROTATION)
            const tokens = await this.generateTokens(
                payload.sub,
                payload.email,
                payload.sessionId
            );

            // 🔥 Update refresh token in DB
            session.refreshToken = tokens.refreshToken;
            await this.sessionsRepo.save(session);

            return tokens;

        } catch (err) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
    }

    //  JWT GENERATION
    private async generateTokens(
        userId: string,
        email: string,
        sessionId: string
    ) {
        const payload = {
            sub: userId,
            email,
            sessionId,
            role: "COMPANY",
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: "15m",
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: "7d",
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async sendForgotOtp(email: string) {

        const company = await this.companyRepo.findOne({
            where: { email }
        });

        if (!company) {
            throw new UnauthorizedException("Company not found");
        }

        const otp = this.otpService.generateOtp();

        await this.otpService.saveOtpForForgotPassword(email, otp);
        await this.emailService.sendOtp(email, otp);

        return { message: "OTP sent for password reset" };
    }
    async verifyForgotOtp(email: string, otp: string) {

        const isValid = await this.otpService.verifySavedForgotPassword(email, otp);

        if (!isValid) {
            throw new UnauthorizedException("Invalid OTP");
        }

        return { message: "OTP verified" };
    }

    async resetPassword(email: string, newPassword: string) {

        const isVerified = await this.otpService.isVerifiedForPasswordChange(email);

        if (!isVerified) {
            throw new UnauthorizedException("OTP not verified");
        }

        const company = await this.companyRepo.findOne({
            where: { email }
        });

        if (!company) {
            throw new UnauthorizedException("Company not found");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        company.password = hashedPassword;

        await this.companyRepo.save(company);

        return { message: "Password updated successfully" };
    }
}