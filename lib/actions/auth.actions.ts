'use server';

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {connectToDatabase} from "@/database/mongoose";
import User from "@/lib/models/user.model";



export const signUpWithEmail = async ({ email, password, fullName, gamertag }: SignUpFormData) => {
    let response;

    try {
        // Better-auth sign-up (without gamertag, which is not supported on the request body)
        response = await auth.api.signUpEmail({ body: { email, password, name: fullName } });
    } catch (e) {
        console.log("Sign up failed", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        return { success: false, error: `Sign up failed: ${message}` };
    }

    if (!response?.user?.email) {
        console.log("Sign up succeeded but response missing user email");
        return { success: true, accountCreated: true, error: "Gamertag update failed: user email missing" };
    }

    try {
        await connectToDatabase();
        const updatedUser = await User.findOneAndUpdate(
            { email: response.user.email },
            { gamertag },
            { new: true }
        );

        if (!updatedUser) {
            console.log("Gamertag update failed: user not found", { email: response.user.email });
            return { success: true, accountCreated: true, error: "Gamertag update failed: user not found" };
        }
    } catch (e) {
        console.log("Gamertag update failed", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        return { success: true, accountCreated: true, error: `Gamertag update failed: ${message}` };
    }

    return { success: true, data: response };
};

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        return { success: false, error: 'Sign in failed' }
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