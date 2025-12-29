# Project File Tree

```
xblade/
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── users/
│   │   │       └── page.tsx
│   │   └── welcome-admin/
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
│   ├── admin/
│   │   ├── AdminHeader.tsx
│   │   ├── AdminNavItems.tsx
│   │   ├── AdminDropdown.tsx
│   │   └── user-management/
│   │       ├── UserActions.tsx
│   │       ├── UserForm.tsx
│   │       ├── UserSearch.tsx
│   │       ├── UserTable.tsx
│   │       └── UsersManagementClient.tsx
│   ├── shared/
│   │   └── BaseHeader.tsx
│   ├── forms/
│   │   ├── FooterLink.tsx
│   │   └── InputField.tsx
│   ├── ui/
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
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
│   │   ├── auth.actions.ts
│   │   └── user.actions.ts
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
├── proxy.ts
├── README.md
├── tsconfig.json
├── FILE-TREE.md
└── USER_MANAGEMENT_README.md
```

## Directory Structure

### `/app`
Next.js App Router directory containing route groups and pages:
- `(admin)/` - Admin route group
  - `admin/` - Admin dashboard page with layout
    - `users/` - User management page
  - `welcome-admin/` - Admin welcome page
- `(auth)/` - Authentication route group (sign-in, sign-up)
- `(root)/` - Root route group (homepage, welcome-user)

### `/components`
React components organized by category:
- `admin/` - Admin-specific components
  - `AdminHeader.tsx`, `AdminNavItems.tsx`, `AdminDropdown.tsx`
  - `user-management/` - User management interface components
    - `UserActions.tsx` - Action dropdown for each user
    - `UserForm.tsx` - Create/edit user form modal
    - `UserSearch.tsx` - Search and filter controls
    - `UserTable.tsx` - User table with pagination and sorting
    - `UsersManagementClient.tsx` - Main client orchestrator
- `shared/` - Shared base components used by both user and admin components
- `forms/` - Form-related components
- `ui/` - Reusable UI components (shadcn/ui)
  - `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `select.tsx`
- Root level: User-specific components (Header, NavItems, UserDropdown)

### `/database`
Database configuration and connection files

### `/lib`
Utility libraries and business logic:
- `actions/` - Server actions
  - `auth.actions.ts` - Authentication server actions
  - `user.actions.ts` - User management operations (CRUD, search, sort, filters, availability checks)
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
- `proxy.ts` - Proxy server configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Node.js dependencies and scripts

## Documentation Files

- `README.md` - Main project documentation
- `FILE-TREE.md` - Project file structure (this file)
- `USER_MANAGEMENT_README.md` - User management interface documentation

