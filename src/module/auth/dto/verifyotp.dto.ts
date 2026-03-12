import { IsEmail, MaxLength, MinLength } from "class-validator";

export class verifyOtpDto {
    @IsEmail()
    email : string

    @MaxLength(6)
    @MinLength(6)
    otp : string
}