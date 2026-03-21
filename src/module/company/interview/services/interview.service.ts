import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Job } from "../../jobs/jobEntity/job.entity";
import { User } from "src/module/user/entities/user.entity";
import { Application } from "../../application/entity/application.entity";
import { Interview } from "../entity/interview.entity";
import { InterviewGeminiService } from "../geminiService/interview-gemini.service";
import { InterviewStatus } from "src/common/enems/interview-status.enum";
import { ApplicationStatus } from "src/common/enems/application-status.enum";

@Injectable()
export class InterviewService {
    constructor(
        @InjectRepository(Job)
        private jobRepo: Repository<Job>,

        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Application)
        private applicationRepo: Repository<Application>,

        @InjectRepository(Interview)
        private interviewRepo: Repository<Interview>,

        private gemini: InterviewGeminiService
    ) { }

    // 🚀 START INTERVIEW (GENERATE QUESTIONS ONLY)
    async startInterview(userId: string, jobId: string) {
        const user = await this.userRepo.findOneBy({ id: userId });
        const job = await this.jobRepo.findOneBy({ id: jobId });

        if (!user || !job) {
            throw new NotFoundException("User or Job not found");
        }

        const questions = await this.generateQuestions(job);

        return {
            questions: questions.questions,
            jobId,
            userId,
        };
    }

    // 🚀 COMPLETE INTERVIEW (FINAL SUBMIT)
    async completeInterview(body: any) {
        const { userId, jobId, questions, answers, resumeUrl, portfolioUrl } = body;

        if (!questions || !answers || questions.length !== answers.length) {
            throw new BadRequestException("Invalid interview data");
        }

        const job = await this.jobRepo.findOneBy({ id: jobId });
        const user = await this.userRepo.findOneBy({ id: userId });

        if (!job || !user) {
            throw new NotFoundException("User or Job not found");
        }

        // prevent duplicate application
        const existing = await this.applicationRepo.findOne({
            where: {
                user: { id: user.id },
                job: { id: job.id },
            },
        });

        if (existing) {
            throw new BadRequestException("Already applied to this job");
        }

        // build structured conversation
        const conversation = questions.map((q: string, i: number) => ({
            question: q,
            answer: answers[i],
        }));

        // 🔥 AI EVALUATION (ONLY 1 CALL)
        const result = await this.evaluateInterview(conversation, job);

        // save application
        const application = this.applicationRepo.create({
            user,
            job,
            resumeUrl,
            portfolioUrl,
            score: result.score,
        });

        const savedApp = await this.applicationRepo.save(application);

        // save interview result
        const interview = this.interviewRepo.create({
            application: savedApp,
            conversation,
            score: result.score,
            feedback: result.feedback,
            difficulty: result.difficulty,
            status: InterviewStatus.COMPLETED,
        });

        await this.interviewRepo.save(interview);

        return {
            message: "Interview completed & application submitted",
            score: result.score,
            feedback: result.feedback,
        };
    }

    async updateApplicationStatus(
        applicationId: string,
        status: ApplicationStatus
    ) {
        const application = await this.applicationRepo.findOne({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException("Application not found");
        }

        application.status = status;

        await this.applicationRepo.save(application);

        return {
            message: "Status updated successfully",
            status,
        };
    }

    async getApplicationDetails(applicationId: string) {
        const application = await this.applicationRepo.findOne({
            where: { id: applicationId },
            relations: [
                "user",
                "job",
                "interview"
            ],
        });

        if (!application) {
            throw new NotFoundException("Application not found");
        }

        const interview = application.interview;

        return {
            application: {
                id: application.id,
                status: application.status,
                score: application.score,
                resumeUrl: application.resumeUrl,
                portfolioUrl: application.portfolioUrl,
                appliedAt: application.appliedAt,
            },

            user: application.user && {
                id: application.user.id,
                name: application.user.name,
                email: application.user.email,
            },

            job: application.job && {
                id: application.job.id,
                title: application.job.title,
                skills: application.job.skills,
            },

            interview: interview && {
                score: interview.score,
                feedback: interview.feedback,
                difficulty: interview.difficulty,
                conversation: interview.conversation,
                createdAt: interview.createdAt,
            }
        };
    }

    //  GENERATE QUESTIONS (HIGH QUALITY PROMPT)
    private async generateQuestions(job: Job) {
        const prompt = `
You are a FAANG-level senior interviewer.

Your task is to create a HIGH-QUALITY structured interview.

Job Role: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.skills}

Generate EXACTLY 12 questions.

Distribution:
- 3 Easy (fundamentals)
- 5 Medium (practical + applied)
- 4 Hard (deep technical / system thinking)

Rules:
- Questions MUST be specific to the job
- Avoid generic questions
- Keep each question under 20 words
- No explanations
- No numbering in text

Return ONLY valid JSON:

{
  "questions": [
    "question 1",
    "question 2",
    ...
  ]
}
`;

        return this.gemini.generateJSON(prompt);
    }

    //  EVALUATION (VERY IMPORTANT PROMPT)
    private async evaluateInterview(conversation: any[], job: Job) {
        const prompt = `
You are a strict FAANG-level interviewer.

Evaluate the candidate based ONLY on answers.

Job Role: ${job.title}
Skills Required: ${job.skills}

Interview Q&A:
${JSON.stringify(conversation)}

Evaluation Criteria:
- Technical accuracy (40%)
- Depth of knowledge (25%)
- Problem solving (20%)
- Communication clarity (15%)

Instructions:
- Be strict and realistic
- Penalize vague answers
- Reward clarity and depth
- Detect if candidate is weak or strong

Return ONLY JSON:

{
  "score": number (0-100),
  "feedback": "detailed feedback (strengths + weaknesses + improvement tips)",
  "difficulty": "easy | medium | hard"
}
`;

        return this.gemini.generateJSON(prompt);
    }
}