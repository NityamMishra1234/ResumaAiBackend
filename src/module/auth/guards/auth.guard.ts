import { AuthGuard } from "@nestjs/passport";

export class jwtAtuhGuard extends AuthGuard('jwt'){}