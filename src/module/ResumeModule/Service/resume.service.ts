import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Resume , ResumeDocument } from "../Entity/resume.schema";
import { ProfileService } from "src/module/profile/profile.service";
import { GeminiService } from "../GeminiService/gemini.service";
import { PdfService } from "../PdfService/pdf.service";
import { S3Service } from "../S3Service/s3.service";
import { CreateResumeDto } from "../DTO/create-resume.dto";

@Injectable()
export class ResumaService {
    private readonly logger = new Logger(ResumaService.name);

    constructor(
        @InjectModel(Resume.name)
        private resumeModel: Model<ResumeDocument>,

        private profileService: ProfileService,
        private geminiService: GeminiService,
        private pdfService: PdfService,
        private s3Service: S3Service,
    ) { }

    async generateResume(userId: string, dto: CreateResumeDto) {
        try {
            const profile = await this.profileService.getMasterProfile(userId);
            if (!profile) throw new BadRequestException("Profile not found");

            const aiContent = await this.geminiService.generateResume({
                profile,
                job: dto
            });

            const finalData = {
                ...aiContent,
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                linkedin: profile.linkedin,
                github: profile.github
            };

            const pdfBuffer = await this.pdfService.generatePdf(
                finalData,
                dto.template || "modern"
            );

            const fileName = `resuma/${dto.jobTitle}/${userId}-${Date.now()}.pdf`;

            const uploadResult = await this.s3Service.uploadFile(
                fileName,
                pdfBuffer,
                "application/pdf"
            );

            const resume = await this.resumeModel.create({
                userId: new Types.ObjectId(userId),
                jobTitle: dto.jobTitle,
                companyName: dto.companyName,
                jobDescription: dto.jobDescription,
                template: dto.template,
                resumeUrl: uploadResult.url,
                aiContent
            });

            return {
                resumaId: resume._id,
                url: uploadResult.url
            };

        } catch (error) {
            this.logger.error("Resume generation failed", error.stack);
            throw new InternalServerErrorException("Failed to generate resume");
        }
    }

    async getSavedResuma(userId: string) {
        try {
            const resumes = await this.resumeModel.find({
                userId: new Types.ObjectId(userId),
                isDeleted: false
            })
                .select("jobTitle companyName template resumeUrl createdAt")
                .sort({ createdAt: -1 });

            return {
                count: resumes.length,
                data: resumes
            };

        } catch (error) {
            this.logger.error("Failed to fetch resumes", error.stack);
            throw new InternalServerErrorException("Failed to fetch resumes");
        }
    }

    async getResumeById(userId: string, resumeId: string) {
        try {
            const resume = await this.resumeModel.findOne({
                _id: resumeId,
                userId: new Types.ObjectId(userId)
            });

            if (!resume) {
                throw new BadRequestException("Resume not found");
            }

            return resume;

        } catch (error) {
            this.logger.error("Failed to fetch resume", error.stack);
            throw error;
        }
    }

    async deleteResume(id: string) {
        const resume = await this.resumeModel.findById(id);

        if (!resume) throw new NotFoundException();

        resume.isDeleted = true;
        resume.deletedAt = new Date();

        await resume.save();

        return { message: "Resume deleted (soft)" };
    }
}