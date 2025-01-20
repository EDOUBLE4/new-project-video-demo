# Phase 0: Project Setup

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done. Prefix "FRONTEND: " or "BACKEND: " to indicate the nature of the task.

---

## Checklist

[ ] FRONTEND: Create a new directory and initialize a Git repository (add .gitignore).  
[ ] FRONTEND: Ensure you have the latest LTS version of Node.js installed.  
[ ] FRONTEND: Run "npm init -y" (or equivalent) to generate package.json and fill in metadata if desired.  
[ ] FRONTEND: Install core dependencies (Next.js, React, React DOM, TypeScript, @types/react, @types/node).  
[ ] FRONTEND: Install Tailwind CSS (tailwindcss, postcss, autoprefixer) and initialize configs (tailwind.config.js, postcss.config.js).  
[ ] FRONTEND: Install Shadcn/UI following its setup guide for Tailwind integration.  
[ ] BACKEND: Install Supabase client libraries (@supabase/supabase-js).  
[ ] FRONTEND: (Optional) Install additional libraries (e.g., Jest, form libraries, utility libraries).  
[ ] FRONTEND: Create folders per @codebase-best-practices.md (app/, components/, lib/, tests/, docs/).  
[ ] FRONTEND: (Optional) Install and configure ESLint & Prettier (npm install -D eslint prettier).  
[ ] FRONTEND: Enable "strict": true in tsconfig.json for maximum type safety.  
[ ] BACKEND: Create a .env.local file to store secrets (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.).  
[ ] BACKEND: Ensure you never commit real credentials to version control; set production vars in hosting platform.  
[ ] FRONTEND: Import Tailwind in your global stylesheet (e.g., app/(root)/layout.tsx or styles/globals.css).  
[ ] FRONTEND: Validate Shadcn/UI setup and theme customizations.  
[ ] FRONTEND: Run "npm run dev" (or equivalent) to ensure Next.js compiles without errors.  
[ ] FRONTEND: Create a minimal page (app/(root)/page.tsx) to confirm routing and Tailwind functionality (e.g., text-red-500).  
[ ] FRONTEND: (Optional) Push to GitHub and set up a CI workflow (GitHub Actions, CircleCI, etc.) for linting and testing.  