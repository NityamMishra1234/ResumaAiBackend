import { Module } from "@nestjs/common";
import { otpServices } from "../services/otp.service";
import { EmailService } from "../services/email.service";

@Module({
    providers: [otpServices ,EmailService],
    exports: [otpServices , EmailService],
})
export class CommonModule { }