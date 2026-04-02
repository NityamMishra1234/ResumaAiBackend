import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CertificationDocument = Certification & Document;

@Schema({ timestamps: true })
export class Certification {

  @Prop({ type: Types.ObjectId, ref: "Profile", required: true, index: true })
  profileId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  certificateUrl: string;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);