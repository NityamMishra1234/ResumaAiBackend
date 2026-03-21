import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";

import { JobService } from "../services/job.service";
import { CreateJobDto } from "../dto/create-job.dto";
import { UpdateJobDto } from "../dto/update-job.dto";
import { jwtAtuhGuard } from "src/module/auth/guards/auth.guard";
import { CompanyGuard } from "../../auth/guard/company.guard";
import { User } from "src/module/user/entities/user.entity";

@Controller("jobs")
export class JobController {
    constructor(private readonly jobService: JobService) { }

    @UseGuards(jwtAtuhGuard)
    @Get()
    getAllJobs(@Query() query: any) {
        return this.jobService.getAllJobs(query);
    }

    // COMPANY - CREATE JOB
    @UseGuards(jwtAtuhGuard, CompanyGuard)
    @Post("/create")
    createJob(@Body() dto: CreateJobDto, @Req() req: any) {
        console.log(req)
        return this.jobService.createJob(req.user.userId, dto);
    }

    //  COMPANY - GET OWN JOBS
    @UseGuards(jwtAtuhGuard, CompanyGuard)
    @Get("company")
    getCompanyJobs(@Req() req: any) {
        return this.jobService.getCompanyJobs(req.user.userId);
    }

    @UseGuards(jwtAtuhGuard, CompanyGuard)
    @Patch(":id")
    updateJob(
        @Param("id") id: string,
        @Body() dto: UpdateJobDto,
        @Req() req: any
    ) {
        return this.jobService.updateJob(id, req.user.userId, dto);
    }
    @UseGuards(jwtAtuhGuard, CompanyGuard)
    @Delete(":id")
    deleteJob(@Param("id") id: string, @Req() req: any) {
        return this.jobService.deleteJob(id, req.user.userId);
    }
}