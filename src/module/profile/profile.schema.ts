import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProfileDocument = Profile & Document;

//  Sub Schemas
@Schema()
class Experience {
  @Prop() title: string;
  @Prop() company: string;
  @Prop() startDate: string;
  @Prop() endDate: string;
  @Prop() description: string;
}

@Schema()
class Education {
  @Prop() school: string;
  @Prop() degree: string;
  @Prop() field: string;
  @Prop() startDate: string;
  @Prop() endDate: string;
}

@Schema()
class Project {
  @Prop() name: string;
  @Prop() description: string;
  @Prop() link: string;
}

@Schema()
class Certification {
  @Prop() name: string;
  @Prop() issuer: string;
  @Prop() date: string;
}

@Schema()
class Skill {
  @Prop() name: string;
  @Prop() level: string;
}

//  MAIN PROFILE
@Schema({ timestamps: true })
export class Profile {

  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true })
  userId: Types.ObjectId;

  @Prop() fullName: string;
  @Prop() email: string;
  @Prop() phone: string;
  @Prop() location: string;
  @Prop() linkedin: string;
  @Prop() github: string;
  @Prop() portfolio: string;
  @Prop() twitter: string;
  @Prop() summary: string;

  //  Embedded arrays
  @Prop({ type: [Experience], default: [] })
  experiences: Experience[];

  @Prop({ type: [Education], default: [] })
  education: Education[];

  @Prop({ type: [Project], default: [] })
  projects: Project[];

  @Prop({ type: [Certification], default: [] })
  certifications: Certification[];

  @Prop({ type: [Skill], default: [] })
  skills: Skill[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);