import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Column,
    CreateDateColumn
} from "typeorm";

import { Application } from "../../application/entity/application.entity";
import { InterviewStatus } from "src/common/enems/interview-status.enum";

@Entity("interviews")
export class Interview {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Application, { onDelete: "CASCADE" })
    @JoinColumn()
    application: Application;

    @Column({
        type: "enum",
        enum: InterviewStatus,
        default: InterviewStatus.NOT_STARTED
    })
    status: InterviewStatus;

    @Column("json", { nullable: true })
    conversation: any;

    @Column({ nullable: true })
    score: number;

    @Column("text", { nullable: true })
    feedback: string;

    @Column({ nullable: true })
    difficulty: string;

    @CreateDateColumn()
    createdAt: Date;
}