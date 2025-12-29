'use server';

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {connectToDatabase} from "@/database/mongoose";
import User from "@/lib/models/user.model";


// Extract the body type from the signUpEmail function parameters
type SignUpInput = NonNullable<Parameters<typeof auth.api.signUpEmail>[0]>;
type BaseSignUpBody = SignUpInput["body"];
// Extend the base type to include gamertag (which is configured in the schema)
type SignUpBody = BaseSignUpBody & { gamertag: string };

export const signUpWithEmail = async ({ email, password, fullName, gamertag }: SignUpFormData) => {
    try {
        // Better-auth sign-up with gamertag included directly
        // The gamertag field is configured in the Better Auth schema with input: true
        const body: SignUpBody = { 
            email, 
            password, 
            name: fullName,
            gamertag 
        };
        
        const response = await auth.api.signUpEmail({ body } as SignUpInput);

        return { success: true, data: response };
    } catch (e) {
        console.log("Sign up failed", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        return { success: false, error: `Sign up failed: ${message}` };
    }
};

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Optional: internal existence check for logging / monitoring only.
    // Never surface DB-specific results to the client to avoid user enumeration.
    
    try {
        await connectToDatabase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log("Sign in attempt with non-existent email:", normalizedEmail);
        }
    } catch (dbError) {
        console.log("Error checking user existence during sign-in:", dbError);
        
    }

    try {
        const response = await auth.api.signInEmail({
            body: { email: normalizedEmail, password },
        });
        return { success: true, data: response };
    } catch (e) {
        console.log("Sign in failed", e);
        // Do not reveal whether the email exists or the password was wrong
        return { success: false, error: "Invalid email or password" };
    }
}


export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}

export const getSession = async (customHeaders?: Headers) => {
    try {
        // Use custom headers if provided (for middleware), otherwise use Next.js headers()
        const headersToUse = customHeaders || await headers();
        const session = await auth.api.getSession({ headers: headersToUse });
        return { success: true, session };
    } catch (e) {
        console.log('Get session failed', e);
        return { success: false, error: 'Get session failed' };
    }
}