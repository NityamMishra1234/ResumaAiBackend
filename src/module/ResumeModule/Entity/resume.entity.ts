// resume.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "src/module/user/entities/user.entity";

@Entity("resumes")
export class Resume {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" })
  user: User;

  @Column()
  jobTitle: string;

  @Column()
  companyName: string;

  @Column({ type: "text" })
  jobDescription: string;

  @Column({ nullable: true })
  template: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ type: "text", nullable: true })
  aiContent: string;

  @Column({ default: false })
  isDeleted: boolean;

 @UpdateDateColumn()
 deletedAt : Date;

  @CreateDateColumn()
  createdAt: Date;
}