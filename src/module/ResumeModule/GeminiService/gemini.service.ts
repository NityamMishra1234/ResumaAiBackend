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
You are an ATS resume generator API.

CRITICAL RULES (MUST FOLLOW):
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations
- Do NOT include backticks
- Do NOT include trailing commas
- Do NOT include undefined/null values
- Ensure JSON is strictly parsable using JSON.parse()

FORMAT (STRICT):
{
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "points": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "points": ["string"],
      "link": "string"
    }
  ],
  "skills": ["string"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "duration": "string"
    }
  ]
}

CONTENT RULES:
- Use ATS-friendly keywords
- Use measurable achievements (numbers, %, impact)
- Keep bullet points concise (max 20 words)
- Avoid special characters like <, >, &, *
- Use plain text only

PROFILE:
${JSON.stringify(data.profile)}

JOB DESCRIPTION:
${JSON.stringify(data.job)}

RETURN JSON ONLY.
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
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("Invalid JSON boundaries");
      }

      const safeJson = cleaned.substring(start, end + 1);

      return JSON.parse(safeJson);

    } catch (error) {
      this.logger.error("❌ PARSE ERROR:");
      this.logger.error(error.stack);
      this.logger.error("❌ RAW RESPONSE:");
      this.logger.error(raw);

      throw new InternalServerErrorException("AI JSON parsing failed");
    }
  }
}