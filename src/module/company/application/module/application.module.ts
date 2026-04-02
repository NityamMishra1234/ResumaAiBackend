import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Application, ApplicationSchema } from "../entity/application.entity";
import { Job, JobSchema } from "../../jobs/jobEntity/job.entity";
import { User, UserSchema } from "src/module/user/entities/user.schema";
import { ApplicationService } from "../services/application.services";
import { ApplicationController } from "../controller/application.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Application.name, schema: ApplicationSchema },
            { name: User.name, schema: UserSchema },
            { name: Job.name, schema: JobSchema },
        ]),
    ],
    providers: [ApplicationService],
    controllers: [ApplicationController],
    exports: [MongooseModule],
})
export class ApplicationModule { }
