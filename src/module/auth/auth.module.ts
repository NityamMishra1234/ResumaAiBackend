import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
    imports : [
        JwtModule.registerAsync({
            inject:[ConfigService],
            useFactory:(config : ConfigService)=>({
                secret: config.get('JWT_ACCESS_SECRET'),
            })
        })
    ],

    controllers:[AuthController],
    providers : [AuthService]
})

export class AuthModule {}