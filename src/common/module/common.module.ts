import { Module } from "@nestjs/common";
import { otpServices } from "../services/otp.service";
import { EmailService } from "../services/email.service";
import { FirebaseAdminProvider } from "../services/firebase";

@Module({
    providers: [otpServices ,EmailService , FirebaseAdminProvider],
    exports: [otpServices , EmailService , FirebaseAdminProvider],
})
export class CommonModule { }