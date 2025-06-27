# Project Rules

This document outlines the directory structure, file naming conventions, and other rules for our AI-first codebase. These rules are designed to ensure our project is modular, scalable, and easy to understand.

---

## Directory Structure

We will follow the standard Next.js App Router directory structure.

```
/
|-- app/                  # Main application directory
|   |-- api/              # API routes (backend logic)
|   |   |-- scrape/       # Logic for scraping data with Firecrawl
|   |   |-- chat/         # Logic for the AI chat agent
|   |-- (chat)/           # Main chat interface route group
|   |   |-- page.tsx      # The main chat page component
|   |-- components/       # Reusable React components
|   |   |-- ui/           # UI components (from Shadcn)
|   |   |-- chat/         # Components specific to the chat interface
|   |-- lib/              # Utility functions and libraries
|   |   |-- supabase.ts   # Supabase client setup
|   |   |-- langchain.ts  # LangChain setup and services
|   |-- layout.tsx        # Root layout
|   |-- globals.css       # Global styles
|-- public/               # Static assets (images, fonts, etc.)
|-- _docs/                # Project documentation
|-- .env.local            # Environment variables
|-- next.config.js        # Next.js configuration
|-- tsconfig.json         # TypeScript configuration
```

---

## File Naming Conventions

-   **Components:** PascalCase (e.g., `ChatMessage.tsx`)
-   **API Routes:** lowercase, kebab-case (e.g., `route.ts` within `app/api/some-route`)
-   **Utility Files:** camelCase (e.g., `supabaseClient.ts`)
-   **All files** should have descriptive names.

---

## Code Conventions

-   **AI-First:** The codebase should be modular, scalable, and easy for both humans and AI to understand.
-   **File Size:** To maximize compatibility with modern AI tools, files should not exceed 500 lines.
-   **Comments:** All functions should have proper TSDoc comments explaining their purpose, parameters, and return values.
-   **Code Style:**
    -   Write concise, technical code.
    -   Use functional and declarative programming patterns; avoid classes.
    -   Throw errors instead of adding fallback values.
    -   Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
    -   Avoid enums; use `as const` for string unions or simple objects.
