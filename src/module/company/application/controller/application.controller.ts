import {
    Controller,
    Get,
    Post,
    Param,
    Req,
    Body,
    UseGuards,
} from "@nestjs/common";

import { ApplicationService } from "../services/application.services";
import { jwtAtuhGuard } from "src/module/auth/guards/auth.guard";

@Controller("applications")
export class ApplicationController {
    constructor(
        private readonly applicationService: ApplicationService
    ) { }



    //  GET MY APPLICATIONS
    @UseGuards(jwtAtuhGuard)
    @Get("/my")
    getMyApplications(@Req() req: any) {
        console.log("REQ USER:", req.user);
        return this.applicationService.getAppliedJobs(
            req.user.userId
        );
    }

    // GET SINGLE APPLICATION
    @UseGuards(jwtAtuhGuard)
    @Get("/:id")
    getApplicationById(
        @Param("id") id: string,
        @Req() req: any
    ) {
        return this.applicationService.getApplicationById(
            id,
            req.user.userId
        );
    }
}