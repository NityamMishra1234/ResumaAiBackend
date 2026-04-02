import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Job, JobSchema } from "../jobEntity/job.entity";
import { Application, ApplicationSchema } from "../../application/entity/application.entity";
import { CompanyModule } from "../../companies/module/company.module";
import { JobService } from "../services/job.service";
import { JobController } from "../controller/job.controller";
import { GeminiServiceJobs } from "../job.gemini.service/gemini.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Job.name, schema: JobSchema },
            { name: Application.name, schema: ApplicationSchema },
        ]),
        CompanyModule,
    ],
    providers: [JobService, GeminiServiceJobs],
    controllers: [JobController],
    exports: [MongooseModule],
})
export class JobModule { }
