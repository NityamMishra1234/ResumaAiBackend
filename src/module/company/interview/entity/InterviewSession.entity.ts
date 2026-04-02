import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InterviewSessionDocument = InterviewSession & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class InterviewSession {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Job", required: true, index: true })
    jobId: Types.ObjectId;

    @Prop({ default: "in-progress" })
    status: string;

    @Prop({ type: Array, default: [] })
    conversation: any[];

    @Prop()
    score: number;

    @Prop()
    expiresAt: Date;

    createdAt: Date;
}

export const InterviewSessionSchema = SchemaFactory.createForClass(InterviewSession);
