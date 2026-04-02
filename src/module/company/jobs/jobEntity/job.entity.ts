import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { JobType } from "src/common/enems/job-type.enum";

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
    @Prop({ required: true, index: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true, enum: JobType })
    type: JobType;

    @Prop()
    salaryMin: number;

    @Prop()
    salaryMax: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: "Company", required: true, index: true })
    companyId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Application" }], default: [] })
    applications: Types.ObjectId[];

    @Prop({ type: [String], default: [] })
    skills: string[];

    @Prop({ index: true })
    slug: string;

    @Prop({ index: true })
    interviewSlug: string;

    @Prop()
    interviewLink: string;

    @Prop()
    linkedinMessage: string;

    @Prop()
    fullDescription: string;

    @Prop({ type: Date, default: null })
    deletedAt?: Date | null;
}

export const JobSchema = SchemaFactory.createForClass(Job);
