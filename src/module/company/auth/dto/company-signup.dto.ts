// dto/company-signup.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CompanySignupDto {

    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;
}