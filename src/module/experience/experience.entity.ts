
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Profile } from "../profile/profile.entity";

@Entity("experiences")
export class Experience {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Profile, profile => profile.experiences)
    profile: Profile;

    @Column()
    company: string;

    @Column()
    role: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column()
    startDate: string;

    @Column({ nullable: true })
    endDate: string;

}