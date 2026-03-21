import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToOne,
    Column,
    CreateDateColumn,
    Index
} from "typeorm";

import { User } from "src/module/user/entities/user.entity";
import { Job } from "../../jobs/jobEntity/job.entity";
import { Interview } from "../../interview/entity/interview.entity";
import { ApplicationStatus } from "src/common/enems/application-status.enum";

@Entity("applications")
@Index(["user", "job"], { unique: true })
export class Application {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { eager: false, onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Job, job => job.applications, { onDelete: "CASCADE" })
    job: Job;

    @OneToOne(() => Interview, interview => interview.application)
    interview: Interview;

    @Column()
    resumeUrl: string;

    @Column({ nullable: true })
    portfolioUrl: string;

    @Column({
        type: "enum",
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING
    })
    status: ApplicationStatus;

    @Column({ nullable: true })
    score: number;



    @CreateDateColumn()
    appliedAt: Date;
}