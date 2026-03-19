// company-auth.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";


import { CompanyAuthService } from "../company.auth.services.ts/company-auth.service";
import { CompanyAuthController } from "../company-auth.controller/company-auth.controller";
import { serviceModule } from "src/common/services/services.module";
import { ConfigService } from "@nestjs/config";
import { Session } from "src/module/sessions/entity/sessions.entity";
import { CompanyModule } from "../../companies/module/company.module";

@Module({
    imports: [
        CompanyModule,
        TypeOrmModule.forFeature([ Session]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: "7d" }
            })
        }),
        serviceModule
    ],
    controllers: [CompanyAuthController],
    providers: [CompanyAuthService]
})
export class CompanyAuthModule { }