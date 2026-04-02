import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './confing/database.config';
import { CacheModule } from '@nestjs/cache-manager';
import { databaseModule } from './dataBase/database.module';
import { AuthModule } from './module/auth/auth.module';
import { ProfileModule } from './module/profile/profile.module';
import { ResumeModule } from './module/ResumeModule/resume.module';
import { CompanyAuthModule } from './module/company/auth/company-auth.module/company-auth.module';
import { JobModule } from './module/company/jobs/module/job.module';
import { CompanyModule } from './module/company/companies/module/company.module';
import { ApplicationModule } from './module/company/application/module/application.module';
import { interviewModule } from './module/company/interview/module/interview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig]
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 600,
      max: 1000
    }),
    databaseModule,
    AuthModule,
    ProfileModule,
    ResumeModule,
    CompanyAuthModule,
    JobModule,
    CompanyModule,
    ApplicationModule,
    interviewModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
