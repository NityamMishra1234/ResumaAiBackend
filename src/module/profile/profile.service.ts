import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "./profile.entity";
import { User } from "../user/entities/user.entity";
import { CreateProfileDto } from "src/dto/create-profile.dto";

@Injectable()
export class ProfileService {

  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private userRepo : Repository<User>,
    @InjectRepository(Profile)
    private  profileRepo: Repository<Profile>,
  ) { }

  async create(user: any, data: CreateProfileDto) {
  try {
    const existingProfile = await this.profileRepo.findOne({
      where: { user: { id: user.id } }
    });

    if (existingProfile) {
      throw new ConflictException("Profile already exists for this user");
    }

    const fullUser = await this.userRepo.findOneBy({ id: user.id });
    if (!fullUser) throw new InternalServerErrorException("User not found");

    const profile = this.profileRepo.create({
      ...data,       
      user: fullUser,
    });

    return await this.profileRepo.save(profile);

  } catch (error) {
    this.logger.error("Error creating profile", error.stack);
    if (error instanceof ConflictException) throw error;
    throw new InternalServerErrorException("Failed to create profile");
  }
}

  async getMasterProfile(userId: string) {

    try {

      const profile = await this.profileRepo.findOne({
        where: { user: { id: userId } },
        relations: [
          "experiences",
          "education",
          "projects",
          "certifications",
          "skills"
        ]
      });

      if (!profile) {
        throw new NotFoundException("Profile not found");
      }

      return profile;

    } catch (error) {

      this.logger.error("Error fetching master profile", error.stack);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException("Failed to fetch profile");
    }
  }

  async updateProfile(profileId: string, data: any) {
  try {

    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
      relations: [
        "experiences",
        "education",
        "projects",
        "certifications",
        "skills"
      ]
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    // 🧠 merge incoming data into existing entity
    Object.assign(profile, data);

    // ✅ THIS is the magic
    const updatedProfile = await this.profileRepo.save(profile);

    return this.getProfileById(profileId);

  } catch (error) {

    this.logger.error("Error updating profile", error.stack);

    if (error instanceof NotFoundException) throw error;

    throw new InternalServerErrorException("Failed to update profile");
  }
}

  async getProfileById(profileId: string) {

    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
      relations: [
        "experiences",
        "education",
        "projects",
        "certifications",
        "skills"
      ]
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  async deleteProfile(profileId: string) {

    try {

      const profile = await this.profileRepo.findOne({
        where: { id: profileId }
      });

      if (!profile) {
        throw new NotFoundException("Profile not found");
      }

      await this.profileRepo.delete(profileId);

      return {
        message: "Profile deleted successfully"
      };

    } catch (error) {

      this.logger.error("Error deleting profile", error.stack);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException("Failed to delete profile");
    }
  }

}