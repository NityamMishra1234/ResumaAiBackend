import * as admin from "firebase-admin";
import { ConfigService } from "@nestjs/config";

export const FirebaseAdminProvider = {
    provide: "FIREBASE_ADMIN",
    useFactory: (config: ConfigService) => {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: config.getOrThrow("FIREBASE_PROJECT_ID"),
                    clientEmail: config.getOrThrow("FIREBASE_CLIENT_EMAIL"),
                    privateKey: config
                        .getOrThrow("FIREBASE_PRIVATE_KEY")
                        .replace(/\\n/g, "\n"),
                }),
            });
        }

        return admin;
    },
    inject: [ConfigService],
};