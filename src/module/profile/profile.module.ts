import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profile } from "./profile.entity";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
import { Experience } from "../experience/experience.entity";
import { Education } from "../education/education.entity";
import { Project } from "../project/project.entity";
import { Certification } from "../certification/certification.entity";
import { Skill } from "../skill/skill.entity";
import { User } from "../user/entities/user.entity";

@Module({
    imports:[TypeOrmModule.forFeature([Profile , Experience , Education, Project , Certification ,Skill, User ])],
    providers:[ProfileService],
    controllers:[ProfileController],
})
export class ProfileModule {}