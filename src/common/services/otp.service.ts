import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";

@Injectable()
export class otpServices {
    constructor(
        @Inject(CACHE_MANAGER)
        private cache: Cache
    ){}

    generateOtp(): string {
        return Math.floor(100000 + Math.random()*900000).toString();
    }

    async storeOtp(email : string , otp : string){
        await this.cache.set(`otp:verifyEmail:${email}` , otp , {ttl : 600} as any)
    }

    async verifyEmail(email : string , otp : string) : Promise<boolean>{
        const storedOtp = await this.cache.get<string>(`otp:verifyEmail:${email}`)

        if(!storedOtp) return false ;

        if (storedOtp !== otp) return false;

        await this.cache.del(`otp:verifyEmail:${email}`)

        await this.cache.set(`otp:Verified${email}`, true , {ttl : 600} as any)

        return true
    }

    async canRequestOtp(email : string):Promise<boolean>{
        const exist = await this.cache.get('otp:verifyEmail:${email}')

        if(exist) return false;

        return true;
    }

    async isVerified (email : string): Promise<boolean>{
        const isVerified =  await this.cache.get(`otp:Verified${email}`)

        if(!isVerified) return false

        return true
    }

    async saveOtpForForgotPassword(email : string , otp : string):Promise<boolean>{
        await this.cache.set(`ForgotPasswordOtp:${email}`, otp , {ttl : 600} as any)

        return true;
    }

    async verifySavedForgotPassword(email : string , otp : string):Promise<boolean>{
        const storedotp = await this.cache.get(`ForgotPasswordOtp:${email}`)

        if(!storedotp) return false

        if(otp !== storedotp) return false

        await this.cache.set(`optVerifiedForPasswordChnage${email}` , true , {ttl : 600} as any)
        return true
    }

    async isVerifiedForPasswordChange (email : string) :Promise<boolean>{
        const stored = await this.cache.get(`optVerifiedForPasswordChnage${email}`)

        if(!stored) return false

        return true
    }
}