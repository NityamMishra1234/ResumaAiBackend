import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Resume , ResumeSchema } from "./Entity/resume.schema";
import { ResumaController } from "./Controller/resume.controller";
import { ResumaService } from "./Service/resume.service";

import { GeminiService } from "./GeminiService/gemini.service";
import { S3Service } from "./S3Service/s3.service";
import { PdfService } from "./PdfService/pdf.service";
import { ProfileModule } from "../profile/profile.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Resume.name, schema: ResumeSchema }
        ]),
        ProfileModule
    ],
    controllers: [ResumaController],
    providers: [
        ResumaService,
        GeminiService,
        S3Service,
        PdfService,
    ]
})
export class ResumeModule { }