declare global {
    interface SignUpFormData {
        fullName: string;
        email: string;
        gamertag: string;
        password: string;
    }

    type SignInFormData = {
        email: string;
        password: string;
    };

    type FormInputProps = {
        name: string;
        label: string;
        placeholder: string;
        type?: string;
        register: UseFormRegister;
        error?: FieldError;
        validation?: RegisterOptions;
        disabled?: boolean;
        value?: string;
    }

    type FooterLinkProps = {
        text: string;
        linkText: string;
        href: string;
    }

    type User = {
          name?: string | null
          email?: string | null
          image?: string | null
      }
        
}

export { };