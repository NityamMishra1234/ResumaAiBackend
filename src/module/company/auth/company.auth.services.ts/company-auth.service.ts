import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Company, CompanyDocument } from "../../companies/entity/company.entity";
import { CompanySignupDto } from "../dto/company-signup.dto";
import { CompanyLoginDto } from "../dto/company-login.dto";
import { otpServices } from "src/common/services/otp.service";
import { EmailService } from "src/common/services/email.service";
import { Session, SessionDocument } from "src/module/sessions/entity/session.schema";

@Injectable()
export class CompanyAuthService {
    constructor(
        @InjectModel(Company.name)
        private companyModel: Model<CompanyDocument>,

        @InjectModel(Session.name)
        private sessionsModel: Model<SessionDocument>,
        private jwtService: JwtService,
        private otpService: otpServices,
        private emailService: EmailService,
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

        const existing = await this.companyModel.findOne({ email: dto.email });

        if (existing) {
            throw new ConflictException("Company already exists");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const company = await this.companyModel.create({
            ...dto,
            password: hashedPassword,
        });

        const session = await this.sessionsModel.create({
            companyId: company._id,
            type: "COMPANY",
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const token = await this.generateTokens(
            company._id.toString(),
            company.email,
            session._id.toString()
        );

        session.refreshToken = token.refreshToken;
        await session.save();

        const { password, ...result } = company.toObject();

        return {
            token,
            company: result,
        };
    }

    async login(dto: CompanyLoginDto, ip: string, userAgent: string) {
        const company = await this.companyModel.findOne({ email: dto.email });

        if (!company) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(dto.password, company.password);

        if (!isMatch) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const session = await this.sessionsModel.create({
            companyId: company._id,
            type: "COMPANY",
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const token = await this.generateTokens(
            company._id.toString(),
            company.email,
            session._id.toString()
        );

        session.refreshToken = token.refreshToken;
        await session.save();

        const { password, ...result } = company.toObject();

        return {
            token,
            company: result,
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

            const session = await this.sessionsModel.findById(payload.sessionId);

            if (!session) {
                throw new UnauthorizedException("Session not found");
            }

            if (session.refreshToken !== token) {
                throw new UnauthorizedException("Token mismatch (possible theft)");
            }

            if (session.expiresAt < new Date()) {
                throw new UnauthorizedException("Session expired");
            }

            const tokens = await this.generateTokens(
                payload.sub,
                payload.email,
                payload.sessionId
            );

            session.refreshToken = tokens.refreshToken;
            await session.save();

            return tokens;
        } catch (err) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
    }

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
        const company = await this.companyModel.findOne({ email });

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

        const company = await this.companyModel.findOne({ email });

        if (!company) {
            throw new UnauthorizedException("Company not found");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        company.password = hashedPassword;
        await company.save();

        return { message: "Password updated successfully" };
    }
}
