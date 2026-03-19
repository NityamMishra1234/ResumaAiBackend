import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Interview } from "../entity/interview.entity";
import { ApplicationModule } from "../../application/module/application.module";
import { User } from "src/module/user/entities/user.entity";
import { InterviewSession } from "../entity/InterviewSession.entity";
import { JobModule } from "../../jobs/module/job.module";
import { InterviewService } from "../services/interview.service";
import { InterviewController } from "../controller/interview.controller";
import { InterviewGeminiService } from "../geminiService/interview-gemini.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Interview, User, InterviewSession]),
        ApplicationModule,
        JobModule,

    ],
    providers: [InterviewService, InterviewGeminiService],
    controllers: [InterviewController]
})
export class interviewModule { }