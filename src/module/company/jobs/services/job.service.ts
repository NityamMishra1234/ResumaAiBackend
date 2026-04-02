import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { nanoid } from "nanoid";

import { Job, JobDocument } from "../jobEntity/job.entity";
import { Company, CompanyDocument } from "../../companies/entity/company.entity";
import { CreateJobDto } from "../dto/create-job.dto";
import { UpdateJobDto } from "../dto/update-job.dto";
import { GeminiServiceJobs } from "../job.gemini.service/gemini.service";
import { Application, ApplicationDocument } from "../../application/entity/application.entity";

@Injectable()
export class JobService {
    constructor(
        @InjectModel(Job.name)
        private jobModel: Model<JobDocument>,

        @InjectModel(Company.name)
        private companyModel: Model<CompanyDocument>,

        @InjectModel(Application.name)
        private applicationModel: Model<ApplicationDocument>,

        private geminiService: GeminiServiceJobs
    ) { }

    async createJob(companyId: string, dto: CreateJobDto) {
        const company = await this.companyModel.findById(companyId);

        if (!company) throw new NotFoundException("Company not found");

        const slug = nanoid(8);
        const interviewSlug = nanoid(10);
        const baseUrl = "http://localhost:9002";
        const jobUrl = `${baseUrl}/jobs/${slug}`;
        const interviewLink = `${baseUrl}/interview/${interviewSlug}`;

        const [fullDescription, linkedinMessage] = await Promise.all([
            this.geminiService.generateEnhancedJD(dto),
            this.geminiService.generateLinkedinMessage(dto, company),
        ]);

        const job = await this.jobModel.create({
            ...dto,
            companyId: new Types.ObjectId(companyId),
            slug,
            interviewSlug,
            interviewLink,
            linkedinMessage,
            fullDescription,
        });

        company.jobs = [...(company.jobs ?? []), job._id as Types.ObjectId];
        await company.save();

        return {
            ...job.toObject(),
            jobUrl,
            interviewLink,
        };
    }

    async getAllJobs(filters: any) {
        const jobs = await this.jobModel
            .find(this.buildJobFilter(filters))
            .populate("companyId")
            .sort({ createdAt: -1 })
            .lean();

        return jobs.map((job: any) => ({
            ...job,
            id: job._id,
            company: job.companyId,
        }));
    }

    async getJobsExcludingApplied(userId: string, filters: any) {
        const appliedJobIds = await this.applicationModel
            .find({ userId: new Types.ObjectId(userId) })
            .distinct("jobId");

        const jobs = await this.jobModel
            .find({
                ...this.buildJobFilter(filters),
                _id: { $nin: appliedJobIds },
            })
            .populate("companyId")
            .sort({ createdAt: -1 })
            .lean();

        return jobs.map((job: any) => ({
            ...job,
            id: job._id,
            company: job.companyId,
        }));
    }

    async getJobBySlug(slug: string) {
        const job = await this.jobModel
            .findOne({ slug, deletedAt: null })
            .populate("companyId")
            .lean();

        if (!job) throw new NotFoundException("Job not found");

        return {
            ...job,
            id: job._id,
            company: (job as any).companyId,
        };
    }

    async getCompanyJobs(companyId: string) {
        return this.jobModel
            .find({
                companyId: new Types.ObjectId(companyId),
                deletedAt: null,
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    async updateJob(jobId: string, companyId: string, dto: UpdateJobDto) {
        const job = await this.jobModel.findById(jobId);

        if (!job) throw new NotFoundException("Job not found");

        if (job.companyId.toString() !== companyId) {
            throw new ForbiddenException("Not your job");
        }

        Object.assign(job, dto);
        await job.save();

        return job;
    }

    async deleteJob(jobId: string, companyId: string) {
        const job = await this.jobModel.findById(jobId);

        if (!job) throw new NotFoundException("Job not found");

        if (job.companyId.toString() !== companyId) {
            throw new ForbiddenException("Not your job");
        }

        job.deletedAt = new Date();
        job.isActive = false;
        await job.save();

        return { message: "Job deleted successfully" };
    }

    private buildJobFilter(filters: any) {
        const query: any = {
            isActive: true,
            deletedAt: null,
        };

        if (filters.location) {
            query.location = { $regex: filters.location, $options: "i" };
        }

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.search) {
            query.title = { $regex: filters.search, $options: "i" };
        }

        if (filters.skills) {
            query.skills = { $in: [new RegExp(filters.skills, "i")] };
        }

        return query;
    }
}
