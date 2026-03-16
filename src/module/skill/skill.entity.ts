import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Profile } from "../profile/profile.entity";

// skill.entity.ts
@Entity("skills")
export class Skill {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Profile, profile => profile.skills)
  profile: Profile;

  @Column() name: string;
  @Column() category: string;
}