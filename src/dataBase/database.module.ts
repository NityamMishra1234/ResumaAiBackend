import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const db = config.get('database');

                return {
                    type: db.type,
                    host: db.host,
                    port: db.port,
                    username: db.username,
                    password: db.password,
                    database: db.database,

                    autoLoadEntities: true,

                    synchronize: db.synchronize,

                    logging: true,
                }
            }
        })
    ]
})

export class databaseModule {};