'use client';

import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import FooterLink from "@/components/forms/FooterLink";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/actions/auth.actions";


const SignUp = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      gamertag: '',
      password: '',
    },
    mode: 'onBlur'
  },);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await signUpWithEmail(data);
      if (result.success) router.push('/');
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <>
      <h1 className="form-title">Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          register={register}
          error={errors.fullName}
          validation={{ required: 'Full name is required', minLength: 2 }}
        />

        <InputField
          name="email"
          label="Email"
          placeholder="your@email.com"
          register={register}
          error={errors.email}
          validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/, message: 'Email address is required' }}
        />

        <InputField
          name="gamertag"
          label="Gamertag"
          placeholder="Enter your gamertag"
          register={register}
          error={errors.gamertag}
          validation={{ required: 'Gamertag is required', minLength: 2 }}
        />

        <InputField
          name="password"
          label="Password"
          placeholder="Enter a strong password"
          type="password"
          register={register}
          error={errors.password}
          validation={{ required: 'Password is required', minLength: 8 }}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account' : 'Start Your Career'}
        </Button>

        <FooterLink text="Already have an account?" linkText=" Sign in" href="/sign-in" />
        <FooterLink text="" linkText="Return to HomePage" href="/" />

      </form>
    </>
  )
}

export default SignUp