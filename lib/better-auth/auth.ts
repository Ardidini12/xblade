import { betterAuth } from "better-auth";
import { mongodbAdapter} from "better-auth/adapters/mongodb";
import { connectToDatabase} from "@/database/mongoose";
import { nextCookies} from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
    if(authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    

    if(!db) throw new Error('MongoDB connection not found');

    authInstance = betterAuth({
        database: mongodbAdapter(db as any),
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            cookieCache: {
              enabled: true,
              maxAge: 5 * 60, // 5 minutes
            },
          },
        plugins: [nextCookies()],
        user: {
            additionalFields: {
                role: {
                    type: "string",
                    input: false, // Prevent user input during sign-up
                    required: false,
                    defaultValue: "user", // Default role for new users
                },
                gamertag: {
                    type: "string",
                    input: true, // Allow user input during sign-up
                    required: true,
                },
            },
        },
    });

    return authInstance;
}

export const auth = await getAuth();