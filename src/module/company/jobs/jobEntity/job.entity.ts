import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index
} from "typeorm";

import { Company } from "../../companies/entity/company.entity";
import { Application } from "../../application/entity/application.entity";
import { JobType } from "src/common/enems/job-type.enum";

@Entity("jobs")
export class Job {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column()
    title: string;

    @Column("text")
    description: string;

    @Column()
    location: string;

    @Column({
        type: "enum",
        enum: JobType
    })
    type: JobType;

    @Column({ nullable: true })
    salaryMin: number;

    @Column({ nullable: true })
    salaryMax: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Company, company => company.jobs, { onDelete: "CASCADE" })
    company: Company;

    @OneToMany(() => Application, app => app.job)
    applications: Application[];

    @Column("simple-array", { nullable: true })
    skills: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}