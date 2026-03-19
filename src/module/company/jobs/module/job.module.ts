import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "../jobEntity/job.entity";
import { CompanyModule } from "../../companies/module/company.module";
import { JobService } from "../services/job.service";
import { JobController } from "../controller/job.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Job]),
        CompanyModule,
    ],
    providers: [JobService],
    controllers: [JobController],
    exports: [
        TypeOrmModule
    ]
})

export class JobModule { }