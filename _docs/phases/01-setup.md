# Phase 1: Setup

This phase focuses on setting up the barebones structure of our Next.js application. The goal is to have a minimal running framework that we can build upon in the next phase.

---

## Tasks

1.  **Initialize Next.js Project:**
    -   Create a new Next.js application using `create-next-app`.
    -   Configure the project with TypeScript and Tailwind CSS.

2.  **Setup Project Structure:**
    -   Create the initial directory structure as defined in `project-rules.md`.

3.  **Install Dependencies:**
    -   Install all necessary dependencies, including Shadcn UI, Supabase client, and LangChain.js.

4.  **Configure Environment:**
    -   Create the `.env.local` file and add placeholder environment variables for Supabase, Firecrawl, and our chosen LLM provider.

5.  **Create Basic UI:**
    -   Create a basic layout in `app/layout.tsx`.
    -   Create a simple "Hello World" page at `app/(chat)/page.tsx` to confirm the setup is working.
