import { IsEmail, MinLength } from "class-validator";

export class registerDto {
    @IsEmail()
    email : string;

    @MinLength(6)
    password : string;

    
}