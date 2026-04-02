import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CompanyDocument = Company & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Company {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    website: string;

    @Prop()
    description: string;

    @Prop()
    location: string;

    @Prop()
    logo: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Job" }], default: [] })
    jobs: Types.ObjectId[];

    createdAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
