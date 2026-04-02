import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApplicationStatus } from "src/common/enems/application-status.enum";

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: { createdAt: "appliedAt", updatedAt: false } })
export class Application {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Job", required: true, index: true })
    jobId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Interview", default: null })
    interviewId: Types.ObjectId | null;

    @Prop({ required: true })
    resumeUrl: string;

    @Prop()
    portfolioUrl: string;

    @Prop({
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    })
    status: ApplicationStatus;

    @Prop()
    score: number;

    appliedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
