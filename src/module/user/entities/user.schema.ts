import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

export enum AuthProvider {
    LOCAL = "LOCAL",
    GOOGLE = "GOOGLE",
}

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    })
    email: string;

    //  supports null (for Google users)
    @Prop({ type: String, default: null, select: false })
    password?: string | null;

    //  SaaS-level: auth provider
    @Prop({
        type: String,
        enum: Object.values(AuthProvider),
        default: AuthProvider.LOCAL,
    })
    provider: AuthProvider;

    //  optional provider ID (Google UID)
    @Prop({ type: String, default: null })
    providerId?: string;

    //  session tracking (optional optimization)
    @Prop({ type: [{ type: Types.ObjectId, ref: "Session" }] })
    sessions: Types.ObjectId[];

    //  account status (very important for SaaS)
    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    //  security tracking
    @Prop({ type: Date, default: null })
    lastLoginAt?: Date;

    @Prop({ type: Number, default: 0 })
    loginAttempts: number;

    @Prop({ type: Date, default: null })
    lockUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
