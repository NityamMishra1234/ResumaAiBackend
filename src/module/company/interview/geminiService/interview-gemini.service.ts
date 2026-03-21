import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class InterviewGeminiService {
    private ai: GoogleGenAI;
    private logger = new Logger(InterviewGeminiService.name);

    constructor(private config: ConfigService) {
        this.ai = new GoogleGenAI({
            apiKey: this.config.getOrThrow("GEMINI_API_KEY"),
        });
    }

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
}