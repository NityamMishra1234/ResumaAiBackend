import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Column
} from "typeorm";

import { User } from "../user/entities/user.entity";
import { Experience } from "../experience/experience.entity";
import { Education } from "../education/education.entity";
import { Project } from "../project/project.entity";
import { Certification } from "../certification/certification.entity";
import { Skill } from "../skill/skill.entity";

// profile.entity.ts
@Entity("profiles")
export class Profile {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true }) fullName: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) location: string;
  @Column({ nullable: true }) linkedin: string;
  @Column({ nullable: true }) github: string;
  @Column({ nullable: true }) portfolio: string;
  @Column({ nullable: true }) twitter: string;
  @Column({ type: "text", nullable: true }) summary: string;

  
  @OneToMany(() => Experience, exp => exp.profile, { cascade: true })
  experiences: Experience[];

  @OneToMany(() => Education, edu => edu.profile, { cascade: true })
  education: Education[];

  @OneToMany(() => Project, proj => proj.profile, { cascade: true })
  projects: Project[];

  @OneToMany(() => Certification, cert => cert.profile, { cascade: true })
  certifications: Certification[];

  @OneToMany(() => Skill, skill => skill.profile, { cascade: true })
  skills: Skill[];
}