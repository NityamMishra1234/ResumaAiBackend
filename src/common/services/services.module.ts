import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { otpServices } from "./otp.service";
import { EmailService } from "./email.service";

@Module({
    imports :[
        CacheModule.register()
    ],
    providers:[otpServices , EmailService],
    exports : [otpServices , EmailService]

})
export class serviceModule{}