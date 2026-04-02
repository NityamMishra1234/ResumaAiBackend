import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Company, CompanySchema } from "../entity/company.entity";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Company.name, schema: CompanySchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class CompanyModule { }
