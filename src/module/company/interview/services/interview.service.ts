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

    // START INTERVIEW (GENERATE QUESTIONS ONLY)
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

    //  COMPLETE INTERVIEW (FINAL SUBMIT)
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

        //  AI EVALUATION (ONLY 1 CALL)
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
You are a senior FAANG interviewer designing a REALISTIC technical interview.

Your goal is to simulate an actual company interview — not theoretical exams.

Job Role: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.skills}

Generate EXACTLY 12 interview questions.

Distribution:
- 3 Easy (fundamentals)
- 5 Medium (real-world usage, debugging, applied thinking)
- 4 EASY AND MEDIUM (problem solving, system design, optimization)

Question Type Logic (VERY IMPORTANT):
- Coding questions are OPTIONAL
- Decide dynamically based on the job role and skills

Guidelines:
- If role is DSA-heavy / backend / algorithmic → include 3–5 coding questions
- If role is frontend / product / design / non-algorithmic → include 0–2 coding questions
- If coding is not relevant → use ONLY "text" questions

Question Type Definitions:
- "text" → conceptual, debugging, reasoning, architecture, decision-making
- "coding" → requires writing code / logic / algorithm

Coding Rules (only if included):
- Must be realistic interview problems (not competitive programming)
- Solvable in 10–25 minutes
- Focus on practical use cases

Text Question Rules:
- Test real understanding, not definitions
- Include scenario-based and debugging questions
- Include trade-offs and decision-making

Quality Rules:
- Questions MUST be specific to the job role
- Avoid generic or cliché questions
- Keep each question under 20 words
- Make them feel like real interview questions
- Maintain natural difficulty progression

Return ONLY valid JSON in this format:

{
  "questions": [
    {
      "question": "string",
      "type": "text | coding",
      "difficulty": "easy | medium | hard"
    }
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