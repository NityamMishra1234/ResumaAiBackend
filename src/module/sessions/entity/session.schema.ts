import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
    @Prop({ type: Types.ObjectId, ref: "User", index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Company", index: true })
    companyId: Types.ObjectId;

    @Prop({ default: "USER" })
    type: "USER" | "COMPANY";

    @Prop({ type: String, default: null })
    refreshToken: string;

    @Prop()
    ip: string;

    @Prop()
    userAgent: string;

    @Prop({ required: true })
    expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);