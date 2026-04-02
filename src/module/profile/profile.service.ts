import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Profile, ProfileDocument } from "./profile.schema";
import { CreateProfileDto } from "src/dto/create-profile.dto";

@Injectable()
export class ProfileService {

  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectModel(Profile.name)
    private profileModel: Model<ProfileDocument>,
  ) { }

  async create(user: any, data: CreateProfileDto) {
    try {
      const existingProfile = await this.profileModel.findOne({
        userId: new Types.ObjectId(user.id)
      });

      if (existingProfile) {
        throw new ConflictException("Profile already exists");
      }

      const profile = await this.profileModel.create({
        ...data,
        userId: new Types.ObjectId(user.id)
      } as any);

      return profile;

    } catch (error) {
      this.logger.error("Error creating profile", error.stack);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException("Failed to create profile");
    }
  }

  async getMasterProfile(userId: string) {
    try {
      const profile = await this.profileModel.findOne({
        userId: new Types.ObjectId(userId)
      });

      if (!profile) {
        throw new NotFoundException("Profile not found");
      }

      return profile;

    } catch (error) {
      this.logger.error("Error fetching profile", error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Failed to fetch profile");
    }
  }

  async updateProfile(profileId: string, data: any) {
    try {
      const profile = await this.profileModel.findById(profileId);

      if (!profile) {
        throw new NotFoundException("Profile not found");
      }

      Object.assign(profile, data);

      await profile.save();

      return this.getProfileById(profileId);

    } catch (error) {
      this.logger.error("Error updating profile", error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Failed to update profile");
    }
  }

  async getProfileById(profileId: string) {
    const profile = await this.profileModel.findById(profileId);

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  async deleteProfile(profileId: string) {
    try {
      const profile = await this.profileModel.findById(profileId);

      if (!profile) {
        throw new NotFoundException("Profile not found");
      }

      await this.profileModel.findByIdAndDelete(profileId);

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