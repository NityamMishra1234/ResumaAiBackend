
import { IsEmail, IsNotEmpty } from "class-validator";

export class CompanyLoginDto {

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}