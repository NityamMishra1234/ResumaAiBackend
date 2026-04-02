import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Job, JobDocument } from "../../jobs/jobEntity/job.entity";
import { User, UserDocument } from "src/module/user/entities/user.schema";
import { Application, ApplicationDocument } from "../../application/entity/application.entity";
import { Interview, InterviewDocument } from "../entity/interview.entity";
import { InterviewGeminiService } from "../geminiService/interview-gemini.service";
import { InterviewStatus } from "src/common/enems/interview-status.enum";
import { ApplicationStatus } from "src/common/enems/application-status.enum";

@Injectable()
export class InterviewService {
    constructor(
        @InjectModel(Job.name)
        private jobModel: Model<JobDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Application.name)
        private applicationModel: Model<ApplicationDocument>,

        @InjectModel(Interview.name)
        private interviewModel: Model<InterviewDocument>,

        private gemini: InterviewGeminiService
    ) { }

    async startInterview(userId: string, jobId: string) {
        const [user, job] = await Promise.all([
            this.userModel.findById(userId).lean(),
            this.jobModel.findById(jobId).lean(),
        ]);

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

    async completeInterview(body: any) {
        const { userId, jobId, questions, answers, resumeUrl, portfolioUrl } = body;

        if (!questions || !answers || questions.length !== answers.length) {
            throw new BadRequestException("Invalid interview data");
        }

        const [job, user] = await Promise.all([
            this.jobModel.findById(jobId),
            this.userModel.findById(userId),
        ]);

        if (!job || !user) {
            throw new NotFoundException("User or Job not found");
        }

        const existing = await this.applicationModel.findOne({
            userId: user._id,
            jobId: job._id,
        });

        if (existing) {
            throw new BadRequestException("Already applied to this job");
        }

        const conversation = questions.map((q: string, i: number) => ({
            question: q,
            answer: answers[i],
        }));

        const result = await this.evaluateInterview(conversation, job);

        const application = await this.applicationModel.create({
            userId: user._id,
            jobId: job._id,
            resumeUrl,
            portfolioUrl,
            score: result.score,
        });

        const interview = await this.interviewModel.create({
            applicationId: application._id,
            conversation,
            score: result.score,
            feedback: result.feedback,
            difficulty: result.difficulty,
            status: InterviewStatus.COMPLETED,
        });

        application.interviewId = interview._id as any;
        await application.save();

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
        const application = await this.applicationModel.findById(applicationId);

        if (!application) {
            throw new NotFoundException("Application not found");
        }

        application.status = status;
        await application.save();

        return {
            message: "Status updated successfully",
            status,
        };
    }

    async getApplicationDetails(applicationId: string) {
        const application = await this.applicationModel
            .findById(applicationId)
            .populate("userId")
            .populate("jobId")
            .populate("interviewId")
            .lean();

        if (!application) {
            throw new NotFoundException("Application not found");
        }

        const interview = (application as any).interviewId;
        const user = (application as any).userId;
        const job = (application as any).jobId;

        return {
            application: {
                id: application._id,
                status: application.status,
                score: application.score,
                resumeUrl: application.resumeUrl,
                portfolioUrl: application.portfolioUrl,
                appliedAt: application.appliedAt,
            },
            user: user && {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            job: job && {
                id: job._id,
                title: job.title,
                skills: job.skills,
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

    private async generateQuestions(job: Job) {
        const prompt = `
You are a senior FAANG interviewer designing a REALISTIC technical interview.

Your goal is to simulate an actual company interview, not theoretical exams.

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
- If role is DSA-heavy / backend / algorithmic, include 3-5 coding questions
- If role is frontend / product / design / non-algorithmic, include 0-2 coding questions
- If coding is not relevant, use ONLY "text" questions

Question Type Definitions:
- "text" => conceptual, debugging, reasoning, architecture, decision-making
- "coding" => requires writing code / logic / algorithm

Coding Rules (only if included):
- Must be realistic interview problems (not competitive programming)
- Solvable in 10-25 minutes
- Focus on practical use cases

Text Question Rules:
- Test real understanding, not definitions
- Include scenario-based and debugging questions
- Include trade-offs and decision-making

Quality Rules:
- Questions MUST be specific to the job role
- Avoid generic or cliche questions
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
