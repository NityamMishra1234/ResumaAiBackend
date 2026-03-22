import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Job } from "../jobEntity/job.entity";
import { Company } from "../../companies/entity/company.entity";
import { CreateJobDto } from "../dto/create-job.dto";
import { UpdateJobDto } from "../dto/update-job.dto";

@Injectable()
export class JobService {
    constructor(
        @InjectRepository(Job)
        private jobRepo: Repository<Job>,

        @InjectRepository(Company)
        private companyRepo: Repository<Company>
    ) { }

    async createJob(companyId: string, dto: CreateJobDto) {
        const company = await this.companyRepo.findOneBy({ id: companyId });

        if (!company) throw new NotFoundException("Company not found");

        const job = this.jobRepo.create({
            ...dto,
            company,
        });

        const savedJobs = await this.jobRepo.save(job);

        const { password: _, ...savedUser } = savedJobs.company

        return savedJobs;
    }

    //  GET ALL JOBS (PUBLIC)
    async getAllJobs(filters: any) {
        const query = this.jobRepo.createQueryBuilder("job")
            .leftJoinAndSelect("job.company", "company")
            .where("job.isActive = :active", { active: true });

        if (filters.location) {
            query.andWhere("job.location LIKE :location", {
                location: `%${filters.location}%`,
            });
        }

        if (filters.type) {
            query.andWhere("job.type = :type", { type: filters.type });
        }

        if (filters.search) {
            query.andWhere("job.title LIKE :search", {
                search: `%${filters.search}%`,
            });
        }
        if (filters.skills) {
            query.andWhere("job.skills LIKE :skill", {
                skill: `%${filters.skills}%`
            });
        }

        return query.orderBy("job.createdAt", "DESC").getMany();
    }

    async getJobsExcludingApplied(userId: string, filters: any) {
        const query = this.jobRepo
            .createQueryBuilder("job")
            .leftJoinAndSelect("job.company", "company")
            .leftJoin("job.applications", "application", "application.userId = :userId", { userId })
            .where("job.isActive = :active", { active: true })
            .andWhere("application.id IS NULL");

        // filters (same as before)
        if (filters.location) {
            query.andWhere("job.location LIKE :location", {
                location: `%${filters.location}%`,
            });
        }

        if (filters.type) {
            query.andWhere("job.type = :type", { type: filters.type });
        }

        if (filters.search) {
            query.andWhere("job.title LIKE :search", {
                search: `%${filters.search}%`,
            });
        }

        if (filters.skills) {
            query.andWhere("job.skills LIKE :skill", {
                skill: `%${filters.skills}%`,
            });
        }

        return query.orderBy("job.createdAt", "DESC").getMany();
    }

    //  GET COMPANY JOBS
    async getCompanyJobs(companyId: string) {
        return this.jobRepo.find({
            where: { company: { id: companyId } },
            relations: ["applications",
                "applications.user",
            ],
            order: { createdAt: "DESC" },
        });
    }

    //  UPDATE JOB
    async updateJob(jobId: string, companyId: string, dto: UpdateJobDto) {
        const job = await this.jobRepo.findOne({
            where: { id: jobId },
            relations: ["company"],
        });

        if (!job) throw new NotFoundException("Job not found");

        //  ownership check
        if (job.company.id !== companyId) {
            throw new ForbiddenException("Not your job");
        }

        Object.assign(job, dto);

        return this.jobRepo.save(job);
    }


    //  DELETE JOB (SOFT DELETE)
    async deleteJob(jobId: string, companyId: string) {
        const job = await this.jobRepo.findOne({
            where: { id: jobId },
            relations: ["company"],
        });

        if (!job) throw new NotFoundException("Job not found");

        if (job.company.id !== companyId) {
            throw new ForbiddenException("Not your job");
        }

        await this.jobRepo.softDelete(jobId);

        return { message: "Job deleted successfully" };
    }
}