import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SkillDocument = Skill & Document;

@Schema({ timestamps: true })
export class Skill {

  // 🔥 Replace relation with ObjectId
  @Prop({ type: Types.ObjectId, ref: "Profile", required: true, index: true })
  profileId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);