import {
    BadRequestException,
    Inject,
    Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { otpServices } from "src/common/services/otp.service";
import { registerDto } from "./dto/register.dto";
import * as bcrypt from "bcrypt";

import { LoginDto } from "./dto/loginDto";
import { EmailService } from "src/common/services/email.service";
import { verifyOtpDto } from "./dto/verifyotp.dto";
import { changePasswrodDto } from "./dto/changePassword.dto";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AuthProvider, User, UserDocument } from "../user/entities/user.schema";
import { Session, SessionDocument } from "../sessions/entity/session.schema";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Session.name)
        private sessionModel: Model<SessionDocument>,

        private jwtService: JwtService,
        private config: ConfigService,
        private otpService: otpServices,
        private emailService: EmailService,

        @Inject("FIREBASE_ADMIN")
        private firebaseAdmin: any,
    ) { }

    async sendRegisterOtp(email: string) {
        const otp = await this.otpService.generateOtp();
        await this.otpService.storeOtp(email, otp);
        await this.emailService.sendOtp(email, otp);

        return { message: `otp sended to ${email}` };
    }

    async verifyRegisteredOtp(dto: verifyOtpDto) {
        const verify = await this.otpService.verifyEmail(dto.email, dto.otp);

        if (!verify) throw new BadRequestException("Invalid or expired otp");

        return { message: "Email is verified" };
    }

    async registerNewUser(dto: registerDto, ip: any, userAgent: any) {
        const validateIsVerified = await this.otpService.isVerified(dto.email);

        if (!validateIsVerified)
            throw new BadRequestException("Email not verified");

        const userExists = await this.userModel.findOne({ email: dto.email.toLowerCase() });

        if (userExists)
            throw new BadRequestException("Already registered");

        const hashed = await bcrypt.hash(dto.password, 12);

        const user = await this.userModel.create({
            email: dto.email.toLowerCase(),
            password: hashed,
            name: dto.name,
            provider: AuthProvider.LOCAL,
            isEmailVerified: true,
        });

        const session = await this.sessionModel.create({
            userId: user._id,
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const token = await this.generateTokens(
            user._id.toString(),
            user.email,
            session._id.toString()
        );

        session.refreshToken = token.refreshToken;
        await session.save();

        const { password, ...result } = user.toObject();

        return { token, user: result };
    }

    async loginuser(dto: LoginDto, ip: any, userAgent: any) {
        const findUser = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .select("+password");

        if (!findUser)
            throw new BadRequestException("User not found");

        if (findUser.provider === AuthProvider.GOOGLE)
            throw new BadRequestException("This account uses Google sign-in");

        if (!findUser.password)
            throw new BadRequestException("Password login is not available for this account");

        const passwordVerify = await bcrypt.compare(
            dto.password,
            findUser.password
        );

        if (!passwordVerify)
            throw new BadRequestException("Invalid password");

        const session = await this.sessionModel.create({
            userId: findUser._id,
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const token = await this.generateTokens(
            findUser._id.toString(),
            findUser.email,
            session._id.toString()
        );

        session.refreshToken = token.refreshToken;
        await session.save();

        const { password, ...savedUser } = findUser.toObject();

        return {
            token,
            user: savedUser,
        };
    }

    async googleAuth(idToken: string, ip: any, userAgent: any) {
        const decoded = await this.firebaseAdmin.auth().verifyIdToken(idToken);

        if (!decoded?.email) {
            throw new BadRequestException("Google account email not found");
        }

        const normalizedEmail = decoded.email.toLowerCase();

        let user = await this.userModel.findOne({ email: normalizedEmail });

        if (user && user.provider === AuthProvider.LOCAL && !user.providerId) {
            throw new BadRequestException("This email is already registered with password login");
        }

        if (!user) {
            user = await this.userModel.create({
                email: normalizedEmail,
                name: decoded.name || normalizedEmail.split("@")[0],
                password: null,
                provider: AuthProvider.GOOGLE,
                providerId: decoded.uid,
                isEmailVerified: true,
                lastLoginAt: new Date(),
            });
        } else {
            user.name = decoded.name || user.name;
            user.provider = AuthProvider.GOOGLE;
            user.providerId = decoded.uid;
            user.isEmailVerified = true;
            user.lastLoginAt = new Date();
            await user.save();
        }

        const session = await this.sessionModel.create({
            userId: user._id,
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const token = await this.generateTokens(
            user._id.toString(),
            user.email,
            session._id.toString()
        );

        session.refreshToken = token.refreshToken;
        await session.save();

        const { password, ...savedUser } = user.toObject();

        return {
            token,
            user: savedUser,
        };
    }

    async changePassword(dto: changePasswrodDto) {
        const isAuthenticated =
            await this.otpService.isVerifiedForPasswordChange(dto.email);

        if (!isAuthenticated)
            throw new BadRequestException("Process expired");

        const user = await this.userModel.findOne({ email: dto.email });

        if (!user) throw new BadRequestException("User not found");

        user.password = await bcrypt.hash(dto.password, 12);
        user.provider = AuthProvider.LOCAL;

        await user.save();
    }

    async logoutUser(sessionId: string) {
        await this.sessionModel.findByIdAndDelete(sessionId);
    }

    async generateTokens(userId: string, email: string, sessionId: string) {
        const payload = {
            sub: userId,
            email,
            sessionId,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.config.get("JWT_ACCESS_SECRET"),
            expiresIn: this.config.get("JWT_ACCESS_EXPIRES"),
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.config.get("JWT_REFRESH_SECRET"),
            expiresIn: this.config.get("JWT_REFRESH_EXPIRES"),
        });

        return { accessToken, refreshToken };
    }

    async refreshToken(token: string) {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: this.config.get("JWT_REFRESH_SECRET"),
        });

        if (!payload)
            throw new BadRequestException("Invalid token");

        return this.generateTokens(
            payload.sub,
            payload.email,
            payload.sessionId
        );
    }
}
