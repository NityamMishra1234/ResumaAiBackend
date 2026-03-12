import { User } from "src/module/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('sessiosns')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @ManyToOne(()=>User , (user) => user.sessions , {onDelete : "CASCADE"})
    user: User

    @Column({ nullable: true })
    refreshToken: string

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}