import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "../entity/application.entity";
import { Job } from "../../jobs/jobEntity/job.entity";
import { User } from "src/module/user/entities/user.entity";
import { ApplicationService } from "../services/application.services";
import { ApplicationController } from "../controller/application.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Application, User, Job]),

    ],

    providers: [ApplicationService],
    controllers: [ApplicationController],
    exports: [
        TypeOrmModule
    ]
})

export class ApplicationModule { }