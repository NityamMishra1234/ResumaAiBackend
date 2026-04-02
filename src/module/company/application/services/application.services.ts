import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Application, ApplicationDocument } from "../entity/application.entity";
import { User, UserDocument } from "src/module/user/entities/user.schema";

@Injectable()
export class ApplicationService {
    constructor(
        @InjectModel(Application.name)
        private applicationModel: Model<ApplicationDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async getAppliedJobs(userId: string) {
        await this.ensureUserExists(userId);

        const applications = await this.applicationModel
            .find({ userId: new Types.ObjectId(userId) })
            .populate({
                path: "jobId",
                populate: { path: "companyId" },
            })
            .sort({ appliedAt: -1 })
            .lean();

        return applications.map((app: any) => ({
            applicationId: app._id,
            status: app.status,
            appliedAt: app.appliedAt,
            resumeUrl: app.resumeUrl,
            portfolioUrl: app.portfolioUrl,
            score: app.score,
            job: app.jobId && {
                id: app.jobId._id,
                title: app.jobId.title,
                location: app.jobId.location,
                type: app.jobId.type,
                salaryMin: app.jobId.salaryMin,
                salaryMax: app.jobId.salaryMax,
            },
            company: app.jobId?.companyId && {
                id: app.jobId.companyId._id,
                name: app.jobId.companyId.name,
            },
        }));
    }

    async getApplicationById(applicationId: string, userId: string) {
        const app = await this.applicationModel
            .findOne({
                _id: applicationId,
                userId: new Types.ObjectId(userId),
            })
            .populate({
                path: "jobId",
                populate: { path: "companyId" },
            })
            .lean();

        if (!app) throw new NotFoundException("Application not found");

        return {
            ...app,
            id: app._id,
            job: (app as any).jobId,
        };
    }

    private async ensureUserExists(userId: string) {
        const user = await this.userModel.findById(userId).lean();

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }
}
