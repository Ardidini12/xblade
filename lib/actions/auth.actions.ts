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
    // First, check if the email exists in the database
    let userExists = false;
    try {
        await connectToDatabase();
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        userExists = !!user;
    } catch (dbError) {
        console.log('Error checking user existence:', dbError);
        // If we can't check the database, we'll fall back to generic error
    }
    
    // If email doesn't exist, return specific error immediately
    if (!userExists) {
        return { success: false, error: 'No account found with this email address' };
    }
    
    // Email exists, attempt sign-in
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })
        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        
        // Email exists, so if sign-in fails, password must be incorrect
        return { success: false, error: 'Incorrect password' }
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