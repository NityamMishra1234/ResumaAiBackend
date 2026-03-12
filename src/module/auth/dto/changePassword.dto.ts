import { IsEmail, MinLength } from "class-validator";

export class changePasswrodDto{
    @IsEmail()
    email : string;

    @MinLength(6)
    password : string;
}