import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeminiServiceJobs {
    private ai: GoogleGenAI;
    private logger = new Logger(GeminiServiceJobs.name);

    constructor(private config: ConfigService) {
        this.ai = new GoogleGenAI({
            apiKey: this.config.getOrThrow("GEMINI_API_KEY"),
        });
    }

    //  CORE GENERATE FUNCTION (REUSABLE)
    async generate(prompt: string): Promise<string> {
        let retries = 2;

        while (retries >= 0) {
            try {
                const res = await this.ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: prompt,
                });

                const text = res.text;

                if (!text) throw new Error("Empty response");

                return text.trim();
            } catch (err: any) {
                if (err.status === 429 && retries > 0) {
                    this.logger.warn("Rate limited. Retrying...");
                    await new Promise((r) => setTimeout(r, 8000));
                    retries--;
                } else {
                    this.logger.error(err);
                    throw new InternalServerErrorException("AI failed");
                }
            }
        }

        throw new InternalServerErrorException("AI failed");
    }

    // JSON PARSER (future use)
    async generateJSON(prompt: string) {
        const raw = await this.generate(prompt);

        try {
            const cleaned = raw
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            return JSON.parse(cleaned);
        } catch (err) {
            this.logger.error("JSON parse failed", raw);
            throw new InternalServerErrorException("Invalid AI response");
        }
    }

    // ================================
    //  JOB SPECIFIC FUNCTIONS
    // ================================

    async generateEnhancedJD(dto: any) {
        const prompt = `
You are a top recruiter.

Create a PREMIUM job description.

Job Title: ${dto.title}
Location: ${dto.location}
Skills: ${dto.skills?.join(", ")}

Base Description:
${dto.description}

Rules:
- Make it structured
- Clear sections
- Modern tone

Format:

About the Role  
Responsibilities  
Requirements  
Bonus Skills  
Benefits  

Make it attractive but real.
`;

        return this.generate(prompt);
    }

    async generateLinkedinMessage(dto: any, company: any) {
        const prompt = `
You are a recruiter writing a HIGH-CONVERTING LinkedIn post.

Company: ${company.name}
Role: ${dto.title}
Location: ${dto.location}
Skills: ${dto.skills?.join(", ")}

Rules:
- Hook in first line
- Human tone (not corporate)
- Show impact
- Short and clean
- End with CTA

No emojis.
`;

        return this.generate(prompt);
    }
}