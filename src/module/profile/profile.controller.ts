import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { jwtAtuhGuard } from "../auth/guards/auth.guard";

@Controller("profile")
export class ProfileController {

  constructor(
    private readonly profileService: ProfileService
  ) {}

  @UseGuards(jwtAtuhGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(@Req() req, @Body() body) {

    const user = req.user;

    const profile = await this.profileService.create(user, body);

    return {
      message: "Profile created successfully",
      data: profile
    };
  }

  @UseGuards(jwtAtuhGuard)
  @Get("master")
  async getMasterProfile(@Req() req) {

    const userId = req.user.id;

    const profile = await this.profileService.getMasterProfile(userId);

    return {
      message: "Profile fetched successfully",
      data: profile
    };
  }

  @UseGuards(jwtAtuhGuard)
  @Patch(":profileId")
  async updateProfile(
    @Param("profileId") profileId: string,
    @Body() body
  ) {

    const profile = await this.profileService.updateProfile(profileId, body);

    return {
      message: "Profile updated successfully",
      data: profile
    };
  }

  @UseGuards(jwtAtuhGuard)
  @Delete(":profileId")
  async deleteProfile(
    @Param("profileId") profileId: string
  ) {

    return await this.profileService.deleteProfile(profileId);
  }

}