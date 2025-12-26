'use server';

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {connectToDatabase} from "@/database/mongoose";



export const signUpWithEmail = async ({ email, password, fullName, gamertag }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } });

        
        if (response?.user?.email) {
            const mongoose = await connectToDatabase();
            const db = mongoose.connection.db;
            if (db) {
            
                await db.collection('user').updateOne(
                    { email: response.user.email }, 
                    { $set: { gamertag } }
                );
            }
        }

        return { success: true, data: response };
    } catch (e) {
        console.log('Sign up or profile update failed', e);
        return { success: false, error: 'Sign up process failed' };
    }
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