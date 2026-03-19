// company-auth.controller.ts
import { Body, Controller, Post, Req } from "@nestjs/common";
import { CompanyAuthService } from "../company.auth.services.ts/company-auth.service";
import { CompanySignupDto } from "../../auth/dto/company-signup.dto";
import { CompanyLoginDto } from "../../auth/dto/company-login.dto";

@Controller("company/auth")
export class CompanyAuthController {

    constructor(private readonly authService: CompanyAuthService) { }

    @Post("send-otp")
    sendOtp(@Body("email") email: string) {
        return this.authService.sendOtp(email);
    }

    @Post("verify-otp")
    verifyOtp(@Body() body: { email: string; otp: string }) {
        return this.authService.verifyOtp(body.email, body.otp);
    }


    @Post("signup")
    signup(
        @Body() dto: CompanySignupDto,
        @Req() req: Request
    ) {
        const ip = (req as any).ip || (req as any).socket?.remoteAddress || "unknown";

        const userAgent = req.headers["user-agent"] || "unknown";

        return this.authService.signup(dto, ip, userAgent);
    }


    @Post('refreshtoken')
    async refresh(@Body() body: any) {
        const { refreshToken } = body;
        return this.authService.refreshToken(refreshToken)
    }

    @Post("login")
    login(@Body() dto: CompanyLoginDto, @Req() req: Request) {

        const ip = (req as any).ip || (req as any).socket?.remoteAddress || "unknown";

        const userAgent = req.headers["user-agent"] || "unknown";
        return this.authService.login(dto, ip, userAgent);
    }

    @Post("forgot-password/send-otp")
    sendForgotOtp(@Body("email") email: string) {
        return this.authService.sendForgotOtp(email);
    }

    @Post("forgot-password/verify-otp")
    verifyForgotOtp(@Body() body: { email: string; otp: string }) {
        return this.authService.verifyForgotOtp(body.email, body.otp);
    }

    @Post("forgot-password/reset")
    resetPassword(@Body() body: { email: string; password: string }) {
        return this.authService.resetPassword(body.email, body.password);
    }
}