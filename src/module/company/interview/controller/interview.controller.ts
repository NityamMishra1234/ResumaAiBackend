import {
    Controller,
    Post,
    Param,
    Body,
    Req,
    UseGuards,
    Patch,
    Get,
} from "@nestjs/common";

import { InterviewService } from "../services/interview.service";
import { jwtAtuhGuard } from "src/module/auth/guards/auth.guard";
import { CompanyGuard } from "../../auth/guard/company.guard";
import { ApplicationStatus } from "src/common/enems/application-status.enum";

@Controller("interview")
export class InterviewController {
    constructor(private readonly service: InterviewService) { }

    // 🚀 START INTERVIEW (GET QUESTIONS)
    @UseGuards(jwtAtuhGuard)
    @Post("start/:jobId")
    start(@Param("jobId") jobId: string, @Req() req: any) {
        return this.service.startInterview(req.user.userId, jobId);
    }

    @UseGuards(jwtAtuhGuard, CompanyGuard)
    @Patch("application/:id/status")
    updateStatus(
        @Param("id") id: string,
        @Body("status") status: ApplicationStatus
    ) {
        return this.service.updateApplicationStatus(id, status);
    }

    //  COMPLETE INTERVIEW (SUBMIT ALL ANSWERS)
    @UseGuards(jwtAtuhGuard)
    @Post("complete")
    complete(
        @Req() req: any,
        @Body()
        body: {
            jobId: string;
            questions: string[];
            answers: string[];
            resumeUrl?: string;
            portfolioUrl?: string;
        }
    ) {
        return this.service.completeInterview({
            userId: req.user.userId,
            ...body,
        });
    }

    // get the interview detials of the application , @Get("application/:id")
    @Get("application/:id")
    getApplicationDetails(@Param("id") id: string) {
        return this.service.getApplicationDetails(id);
    }
}