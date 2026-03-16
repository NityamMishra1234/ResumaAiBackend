
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn , JoinColumn } from "typeorm";
import { Profile } from "../profile/profile.entity";

// project.entity.ts
@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Profile, profile => profile.projects)
  profile: Profile;

  @Column() title: string;
  @Column() description: string;
  @Column({ nullable: true }) githubUrl: string;
  @Column({ nullable: true }) projectUrl: string;
}
