import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ResumaService } from "../Service/resume.service";
import { jwtAtuhGuard } from "src/module/auth/guards/auth.guard";
import { CreateResumeDto } from "../DTO/create-resume.dto";

@Controller("resume")
export class ResumaController {
    constructor(
        private resumaService: ResumaService
    ) { }

    @UseGuards(jwtAtuhGuard)
    @Post("generate")
    async generateResuma(@Req() req, @Body() dto: CreateResumeDto) {
        const userId = req.user.userId
        console.log(userId)

        const result = await this.resumaService.generateResume(userId, dto)
        return {
            message: "Resume generated successfully",
            data: result
        };
    }


    @UseGuards(jwtAtuhGuard)
    @Get("/all")
    getAll(@Req() req) {
        return this.resumaService.getSavedResuma(req.user.id);
    }

    @UseGuards(jwtAtuhGuard)
    @Get(":id")
    getOne(@Req() req, @Param("id") id: string) {
        return this.resumaService.getResumeById(req.user.id, id);
    }

    @UseGuards(jwtAtuhGuard)
    @Delete(":id")
    delete( @Param("id") id: string) {
        return this.resumaService.deleteResume( id);
    }
}