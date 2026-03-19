// company.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class CompanyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        console.log("in company guard ", req.user?.role)
        console.log("in company user", req.user)
        return req.user?.role === "COMPANY";
    }
}   