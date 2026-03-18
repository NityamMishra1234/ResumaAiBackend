import { User } from "src/module/user/entities/user.entity";
import { Company } from "src/module/company/companies/entity/company.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("sessions")
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @ManyToOne(() => User, (user) => user.sessions, {
        onDelete: "CASCADE",
        nullable: true
    })
    user: User;

    @Index()
    @ManyToOne(() => Company, {
        onDelete: "CASCADE",
        nullable: true
    })
    company: Company;


    @Column({ default: "USER" })
    type: "USER" | "COMPANY";

    @Column({ type: "text", nullable: true })
    refreshToken: string;

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}