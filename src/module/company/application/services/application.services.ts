    import {
        Injectable,
        NotFoundException,
        ConflictException,
    } from "@nestjs/common";
    import { InjectRepository } from "@nestjs/typeorm";
    import { Repository } from "typeorm";

    import { Application } from "../entity/application.entity";
    import { Job } from "../../jobs/jobEntity/job.entity";
    import { User } from "src/module/user/entities/user.entity";

    @Injectable()
    export class ApplicationService {
        constructor(
            @InjectRepository(Application)
            private applicationRepo: Repository<Application>,

            @InjectRepository(Job)
            private jobRepo: Repository<Job>,

            @InjectRepository(User)
            private userRepo: Repository<User>,
        ) { }

        //  APPLY JOB (PRODUCTION READY)


        //  GET USER APPLIED JOBS
        async getAppliedJobs(userId: string) {
            const applications = await this.applicationRepo
                .createQueryBuilder("application")
                .leftJoinAndSelect("application.job", "job")
                .leftJoinAndSelect("job.company", "company")
                .leftJoin("application.user", "user")
                .where("user.id = :userId", { userId })
                .orderBy("application.appliedAt", "DESC")
                .getMany();

            return applications.map((app) => ({
                applicationId: app.id,
                status: app.status,
                appliedAt: app.appliedAt,

                resumeUrl: app.resumeUrl,
                portfolioUrl: app.portfolioUrl,
                score: app.score,

                job: {
                    id: app.job.id,
                    title: app.job.title,
                    location: app.job.location,
                    type: app.job.type,
                    salaryMin: app.job.salaryMin,
                    salaryMax: app.job.salaryMax,
                },

                company: {
                    id: app.job.company.id,
                    name: app.job.company.name,
                },
            }));
        }

        //  GET SINGLE APPLICATION
        async getApplicationById(applicationId: string, userId: string) {
            const app = await this.applicationRepo.findOne({
                where: { id: applicationId, user: { id: userId } },
                relations: ["job", "job.company"],
            });

            if (!app) throw new NotFoundException("Application not found");

            return app;
        }
    }