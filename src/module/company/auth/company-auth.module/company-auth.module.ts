import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";

import { CompanyAuthService } from "../company.auth.services.ts/company-auth.service";
import { CompanyAuthController } from "../company-auth.controller/company-auth.controller";
import { serviceModule } from "src/common/services/services.module";
import { ConfigService } from "@nestjs/config";
import { Session, SessionSchema } from "src/module/sessions/entity/session.schema";
import { CompanyModule } from "../../companies/module/company.module";

@Module({
    imports: [
        CompanyModule,
        MongooseModule.forFeature([
            { name: Session.name, schema: SessionSchema },
        ]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get("JWT_ACCESS_SECRET"),
                signOptions: { expiresIn: "7d" },
            }),
        }),
        serviceModule,
    ],
    controllers: [CompanyAuthController],
    providers: [CompanyAuthService],
})
export class CompanyAuthModule { }
