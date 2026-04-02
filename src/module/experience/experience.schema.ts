import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ExperienceDocument = Experience & Document;

@Schema({ timestamps: true })
export class Experience {

    // 🔥 Replace relation with ObjectId
    @Prop({ type: Types.ObjectId, ref: "Profile", required: true, index: true })
    profileId: Types.ObjectId;

    @Prop({ required: true })
    company: string;

    @Prop({ required: true })
    role: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    startDate: string;

    @Prop()
    endDate: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);