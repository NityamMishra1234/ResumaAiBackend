import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({

    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({

                uri: "mongodb://nityamHirewise:hirewise123@ac-ogf4hor-shard-00-00.n19psaf.mongodb.net:27017,ac-ogf4hor-shard-00-01.n19psaf.mongodb.net:27017,ac-ogf4hor-shard-00-02.n19psaf.mongodb.net:27017/?ssl=true&replicaSet=atlas-10931h-shard-0&authSource=admin&appName=Cluster0",
            }),

        }),
    ],
})

export class databaseModule { }
