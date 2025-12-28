'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, getSession } from '@/lib/actions/auth.actions';
import { useState } from 'react';


const SignIn = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    // Function to get user session and redirect based on role
    const redirectAfterLogin = async () => {
        try {
            const result = await getSession();
            if (result.success && result.session) {
                const userRole = (result.session.user as { role?: string })?.role;
                const redirectParam = searchParams.get('redirect');
                
                // If there's a redirect parameter, use it (for protected routes)
                if (redirectParam) {
                    router.push(redirectParam);
                    return;
                }
                
                // Otherwise, redirect based on role
                if (userRole === 'admin') {
                    router.push('/welcome-admin');
                } else {
                    router.push('/welcome-user');
                }
            } else {
                // Fallback to welcome-user if session fetch fails
                router.push('/welcome-user');
            }
        } catch (error) {
            console.error('Error fetching session:', error);
            // Fallback to welcome-user if session fetch fails
            router.push('/welcome-user');
        }
    };
  
    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if(result.success) {
                setIsRedirecting(true);
                // Small delay to ensure session is set
                setTimeout(() => {
                    redirectAfterLogin();
                }, 100);
            }
        } catch (e) {
            console.error(e);
        }
    }
    return (
        <>
            <h1 className="form-title">Welcome back</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="your@email.com"
                    register={register}
                    error={errors.email}
                    validation={{ 
                        required: 'Email is required', 
                        pattern: { 
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                            message: 'Please enter a valid email address' 
                        } 
                    }}
                />
                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                />

                <Button type="submit" disabled={isSubmitting || isRedirecting} className="yellow-btn w-full mt-5">
                    {isSubmitting || isRedirecting ? 'Signing In...' : 'Sign In'}
                </Button>

                <FooterLink text="Don't have an account?" linkText=" Create an account" href="/sign-up" />
                <FooterLink text="" linkText="Return to HomePage" href="/" />
            </form>

        </>
    );
};

export default SignIn;