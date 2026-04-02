import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User, UserSchema } from "../user/entities/user.schema";
import { Session, SessionSchema } from "../sessions/entity/session.schema";
import { serviceModule } from "src/common/services/services.module";
import { jwtStrategy } from "./strategy/jwt.strategy";
import { CommonModule } from "src/common/module/common.module";

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get("JWT_ACCESS_SECRET"),
            }),
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Session.name, schema: SessionSchema },
        ]),
        serviceModule,
        CommonModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, jwtStrategy],
})
export class AuthModule { }
