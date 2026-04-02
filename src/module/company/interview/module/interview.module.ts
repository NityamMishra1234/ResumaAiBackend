import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Interview, InterviewSchema } from "../entity/interview.entity";
import { ApplicationModule } from "../../application/module/application.module";
import { User, UserSchema } from "src/module/user/entities/user.schema";
import { InterviewSession, InterviewSessionSchema } from "../entity/InterviewSession.entity";
import { JobModule } from "../../jobs/module/job.module";
import { InterviewService } from "../services/interview.service";
import { InterviewController } from "../controller/interview.controller";
import { InterviewGeminiService } from "../geminiService/interview-gemini.service";
import { Application, ApplicationSchema } from "../../application/entity/application.entity";
import { Job, JobSchema } from "../../jobs/jobEntity/job.entity";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Interview.name, schema: InterviewSchema },
            { name: User.name, schema: UserSchema },
            { name: InterviewSession.name, schema: InterviewSessionSchema },
            { name: Application.name, schema: ApplicationSchema },
            { name: Job.name, schema: JobSchema },
        ]),
        ApplicationModule,
        JobModule,
    ],
    providers: [InterviewService, InterviewGeminiService],
    controllers: [InterviewController],
})
export class interviewModule { }
