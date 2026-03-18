// company.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class CompanyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        return req.user?.role === "company";
    }
}