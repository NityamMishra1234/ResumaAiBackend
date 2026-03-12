import { IsEmail } from "class-validator";

export class loginDto {
    @IsEmail()
    email : string

    password : string
}