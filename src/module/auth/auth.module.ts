import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Session } from "../sessions/entity/sessions.entity";

import { serviceModule } from "src/common/services/services.module";
import { jwtStrategy } from "./strategy/jwt.strategy";
import { CommonModule } from "src/common/module/common.module";

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_ACCESS_SECRET'),
            })
        }),
        TypeOrmModule.forFeature([User, Session]),
        serviceModule,
        CommonModule
    ],

    controllers: [AuthController],
    providers: [AuthService, jwtStrategy],

})

export class AuthModule { }