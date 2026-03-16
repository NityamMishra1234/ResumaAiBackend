import { Column, Entity, ManyToOne, PrimaryGeneratedColumn ,JoinColumn } from "typeorm";
import { Profile } from "../profile/profile.entity";

// education.entity.ts
@Entity('educations')
export class Education {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ✅ No @Column() profileId — TypeORM handles the FK automatically
  @ManyToOne(() => Profile, profile => profile.education)
  profile: Profile;

  @Column() institution: string;
  @Column() degree: string;
  @Column() field: string;
  @Column() startDate: string;
  @Column() endDate: string;
}