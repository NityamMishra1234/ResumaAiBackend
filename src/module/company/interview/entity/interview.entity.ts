import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { InterviewStatus } from "src/common/enems/interview-status.enum";

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Interview {
    @Prop({ type: Types.ObjectId, ref: "Application", required: true, index: true })
    applicationId: Types.ObjectId;

    @Prop({
        enum: InterviewStatus,
        default: InterviewStatus.NOT_STARTED,
    })
    status: InterviewStatus;

    @Prop({ type: Array, default: [] })
    conversation: any[];

    @Prop()
    score: number;

    @Prop()
    feedback: string;

    @Prop()
    difficulty: string;

    createdAt: Date;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
