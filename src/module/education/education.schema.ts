import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EducationDocument = Education & Document;

@Schema({ timestamps: true })
export class Education {

  // 🔥 Replace relation with ObjectId
  @Prop({ type: Types.ObjectId, ref: "Profile", required: true, index: true })
  profileId: Types.ObjectId;

  @Prop({ required: true })
  institution: string;

  @Prop({ required: true })
  degree: string;

  @Prop({ required: true })
  field: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);