# Project File Tree

```
xblade/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── (root)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── welcome-user/
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── forms/
│   │   ├── FooterLink.tsx
│   │   └── InputField.tsx
│   ├── ui/
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   ├── Header.tsx
│   ├── NavItems.tsx
│   └── UserDropdown.tsx
├── database/
│   └── mongoose.ts
├── lib/
│   ├── actions/
│   │   └── auth.actions.ts
│   ├── better-auth/
│   │   └── auth.ts
│   ├── models/
│   │   └── user.model.ts
│   └── utils.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── types/
│   └── global.d.ts
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── FILE-TREE.md
```

## Directory Structure

### `/app`
Next.js App Router directory containing route groups and pages:
- `(admin)/` - Admin route group
- `(auth)/` - Authentication route group (sign-in, sign-up)
- `(root)/` - Root route group (homepage, welcome-user)

### `/components`
React components organized by category:
- `forms/` - Form-related components
- `ui/` - Reusable UI components (shadcn/ui)

### `/database`
Database configuration and connection files

### `/lib`
Utility libraries and business logic:
- `actions/` - Server actions
- `better-auth/` - Authentication configuration
- `models/` - Data models

### `/public`
Static assets (SVG icons)

### `/types`
TypeScript type definitions

## Configuration Files

- `components.json` - shadcn/ui configuration
- `eslint.config.mjs` - ESLint configuration
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Node.js dependencies and scripts

