import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { registerDto } from "./dto/register.dto";
import type { Request } from "express";
import { verifyOtpDto } from "./dto/verifyotp.dto";
import { LoginDto } from "./dto/loginDto";

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('refreshtoken')
    async refresh(@Body() body: any) {
        const { refreshToken } = body;
        return this.authService.refreshToken(refreshToken)
    }

    @Post('send-otp')
    async sendOtp(@Body() body: any) {
        return this.authService.sendRegisterOtp(body.email)
    }

    @Post('veriy-email')
    async verifyEmail(@Body() body: verifyOtpDto) {
        return this.authService.verifyRegisteredOtp(body)
    }
    @Post('register')
    async register(
        @Body() body: registerDto,
        @Req() req: Request
    ) {

        const ip = req.ip;
        const userAgent = req.headers['user-agent'];

        return this.authService.registerNewUser(body, ip, userAgent);
    }
    @Post('login')
    async login(
        @Body() body: LoginDto,
        @Req() req: Request
    ) {
        console.log("requestFrom postman", body)
        const ip = req.ip
        const userAgent = req.headers['user-agent']
        return this.authService.loginuser(body, ip, userAgent)
    }

    @Post("google")
    async googleAuth(
        @Body() body: { idToken: string },
        @Req() req: Request
    ) {
        const ip = req.ip;
        const userAgent = req.headers["user-agent"];

        return this.authService.googleAuth(body.idToken, ip, userAgent);
    }

}