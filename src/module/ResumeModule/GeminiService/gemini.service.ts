import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeminiService {

  private ai: GoogleGenAI;
  private readonly logger = new Logger(GeminiService.name);

  constructor(private configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>("GEMINI_API_KEY")
    });
  }

  async generateResume(data: any) {

    const prompt = `
You are a world-class ATS resume writer.

STRICT RULES:
- Output ONLY valid JSON
- No extra text
- No markdown
- Use bullet-style, ATS-friendly content
- Quantify achievements where possible

OUTPUT FORMAT:
{
  "summary": "string",
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "points": ["", "", ""]
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "points": ["", ""],
      "link": ""
    }
  ],
  "skills": ["", ""],
  "education": [
    {
      "institution": "",
      "degree": "",
      "duration": ""
    }
  ]
}

PROFILE:
${JSON.stringify(data.profile)}

JOB DESCRIPTION:
${JSON.stringify(data.job)}
`;
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const raw = response.text;

if (!raw) {
  this.logger.error("Empty response from Gemini");
  throw new InternalServerErrorException("AI returned empty response");
}

    this.logger.log("RAW AI RESPONSE:");
    this.logger.log(raw);

    try {
      // 🔥 Clean possible bad formatting
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);

    } catch (error) {
      this.logger.error("Failed to parse AI response", error.stack);

      throw new InternalServerErrorException(
        "AI returned invalid JSON. Please try again."
      );
    }
  }
}