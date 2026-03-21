import { Entity ,PrimaryGeneratedColumn , ManyToOne , Column , CreateDateColumn } from "typeorm";
import { User } from "src/module/user/entities/user.entity";
import { Job } from "../../jobs/jobEntity/job.entity";

@Entity("interview_sessions")
export class InterviewSession {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Job)
    job: Job;

    @Column({
        default: "in-progress"
    })
    status: string; // in-progress | completed | expired

    @Column({ type: "json", nullable: true })
    conversation: any;

    @Column({ nullable: true })
    score: number;

    @Column({ nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}