// company.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";

@Entity("companies")
export class Company {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    logo: string;

    @CreateDateColumn()
    createdAt: Date;
}