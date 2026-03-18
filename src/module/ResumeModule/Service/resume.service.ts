import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Resume } from "../Entity/resume.entity";
import { Repository } from "typeorm";
import { ProfileService } from "src/module/profile/profile.service";
import { GeminiService } from "../GeminiService/gemini.service";
import { PdfService } from "../PdfService/pdf.service";
import { S3Service } from "../S3Service/s3.service";
import { CreateResumeDto } from "../DTO/create-resume.dto";

@Injectable()
export class ResumaService {
    private readonly logger = new Logger(ResumaService.name);

    constructor(
        @InjectRepository(Resume)
        private resumaRepo: Repository<Resume>,
        private profileService: ProfileService,
        private geminiService: GeminiService,
        private pdfService: PdfService,
        private s3Service: S3Service,
    ) { }

    async generateResume(userId: string, dto: CreateResumeDto) {
        try {
            const profile = await this.profileService.getMasterProfile(userId)
            if (!profile) throw new BadRequestException("Profile not found")
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
            console.log(profile)
            this.logger.log(aiContent)
            const pdfBuffer = await this.pdfService.generatePdf(
                finalData,
                dto.template || "modern"
            );
            this.logger.log(pdfBuffer)
            const fileName = `resuma/${dto.jobTitle}/${userId}-${Date.now()}.pdf`

            const uploadResult = await this.s3Service.uploadFile(
                fileName,
                pdfBuffer,
                "application/pdf"
            );

            const resuma = this.resumaRepo.create({
                user: { id: userId } as any,
                jobTitle: dto.jobTitle,
                companyName: dto.companyName,
                jobDescription: dto.jobDescription,
                template: dto.template,
                resumeUrl: uploadResult.url,
                aiContent
            });

            await this.resumaRepo.save(resuma)

            return {
                resumaId: resuma.id,
                url: uploadResult.url
            }

        } catch (error) {
            this.logger.error("Resume generation failed", error.stack);
            throw new InternalServerErrorException("Failed to generate resume");
        }
    }
   async getSavedResuma(userId: string) {
    try {
        const resumes = await this.resumaRepo.find({
            where: {
                user: { id: userId },
                isDeleted: false
            },
            select: [
                "id",
                "jobTitle",
                "companyName",
                "template",
                "resumeUrl",
                "createdAt"
            ],
            order: {
                createdAt: "DESC"
            }
        });

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
        const resume = await this.resumaRepo.findOne({
            where: {
                id: resumeId,
                user: { id: userId }
            }
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
  const resume = await this.resumaRepo.findOne({ where: { id } });

  if (!resume) throw new NotFoundException();

  resume.isDeleted = true;
  resume.deletedAt = new Date();

  await this.resumaRepo.save(resume);

  return { message: "Resume deleted (soft)" };
}
    
}

