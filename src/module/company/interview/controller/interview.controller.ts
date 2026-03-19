import {
    Controller,
    Post,
    Param,
    Body,
    Req,
    UseGuards,
} from "@nestjs/common";

import { InterviewService } from "../services/interview.service";
import { jwtAtuhGuard } from "src/module/auth/guards/auth.guard";

@Controller("interview")
export class InterviewController {
    constructor(private readonly service: InterviewService) { }

    // 🚀 START INTERVIEW (GET QUESTIONS)
    @UseGuards(jwtAtuhGuard)
    @Post("start/:jobId")
    start(@Param("jobId") jobId: string, @Req() req: any) {
        return this.service.startInterview(req.user.userId, jobId);
    }

    // 🚀 COMPLETE INTERVIEW (SUBMIT ALL ANSWERS)
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
}