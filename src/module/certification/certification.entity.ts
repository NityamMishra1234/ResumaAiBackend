import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Profile } from "../profile/profile.entity";

// certification.entity.ts
@Entity("certifications")
export class Certification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Profile, profile => profile.certifications)
  profile: Profile;

  @Column() title: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) certificateUrl: string;
}