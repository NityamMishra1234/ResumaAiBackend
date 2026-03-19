import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "../entity/application.entity";
import { Job } from "../../jobs/jobEntity/job.entity";
import { User } from "src/module/user/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Application, User]),
        Job,
    ],
    exports: [
        TypeOrmModule
    ]
})

export class ApplicationModule { }