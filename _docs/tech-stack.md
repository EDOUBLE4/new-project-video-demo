# Technology Stack

This document outlines the technology stack for the AI property management agent. The stack is chosen to be modern, efficient, and scalable, with a unified full-stack approach using TypeScript.

---

## Recommended Technology Stack

| Category | Recommendation | Description |
| :--- | :--- | :--- |
| **Language** | **TypeScript** | An extension of JavaScript that adds static typing. It helps catch errors early, improves code quality, and is perfect for building a scalable and maintainable application. |
| **Framework** | **Next.js** | A full-stack React framework. We will use it to build the user-facing chat interface and the backend API that powers the AI agent. Its server-side capabilities are excellent for performance and handling API logic. |
| **UI Library** | **Shadcn UI** | A collection of beautifully designed, accessible, and reusable components built with Radix UI and Tailwind CSS. It will allow us to build a polished user interface very quickly. |
| **Database** | **Supabase (PostgreSQL + pgvector)** | An open-source Firebase alternative. It provides a robust PostgreSQL database, authentication, and auto-generated APIs. Crucially, it supports the `pgvector` extension, allowing us to store vector embeddings and perform powerful semantic search alongside traditional filtering, all within the same database. |
| **Hosting** | **Vercel** | The platform created by the makers of Next.js. It offers a best-in-class, git-based deployment workflow and includes features like Cron Jobs, which we will use to schedule our daily data scraping tasks. |
| **AI Integration**| **OpenAI Agents SDK (`openai-agents-js`)** | A new, lightweight framework from OpenAI for building multi-agent workflows. We will use it to create, manage, and orchestrate our AI agent, including defining its tools (like database search) and handling user interactions. |
| **Data Scraping**| **Firecrawl** | An API service designed to crawl and scrape websites. We will use Firecrawl to extract apartment availability data from various property websites and ingest it into our Supabase database. |

---

## Best Practices and Conventions

### TypeScript

-   **Strict Mode:** Enable `strict` mode in `tsconfig.json` to catch as many potential errors as possible at compile time.
-   **Explicit Types:** Avoid using `any` whenever possible. Define explicit types and interfaces for all data structures.
-   **ESM Imports/Exports:** Use ES module syntax (`import`/`export`) for consistency.

### Next.js

-   **App Router:** Utilize the App Router for all new components and routes to leverage the latest features like Server Components and layouts.
-   **Server Components:** Use Server Components by default to keep the client-side JavaScript bundle small. Only use Client Components (`'use client'`) when interactivity is required.
-   **API Routes:** Place all backend logic, including Firecrawl integration and LangChain services, within API routes in the `app/api` directory.
-   **Environment Variables:** Store all sensitive keys (Supabase, Firecrawl, LLM provider) in `.env.local` and access them using `process.env`.

### Shadcn UI

-   **CLI for Components:** Use the Shadcn CLI to add new components to the project. This ensures they are added correctly and can be easily customized.
-   **Theming:** Customize the default theme via CSS variables in `globals.css` to match our brand identity.

### Supabase

-   **Row-Level Security (RLS):** Enable RLS on all tables containing sensitive data to ensure users can only access what they are permitted to.
-   **Database Migrations:** Use Supabase's built-in migration tools to manage all database schema changes. Avoid making changes directly in the Supabase dashboard.
-   **Connection Pooling:** Use a connection pooler (like the one provided by Supabase) to manage database connections efficiently, especially in a serverless environment like Vercel.
-   **pgvector:** When storing descriptions for semantic search, generate embeddings using a consistent model and store them in a `vector` column. Create an IVFFlat index on the vector column to speed up similarity searches.

### Vercel

-   **Git-Based Deployments:** Connect our Git repository to Vercel for automatic deployments on every push to the main branch.
-   **Cron Jobs:** Use Vercel's Cron Jobs to trigger our scraping API route on a daily schedule.

### OpenAI Agents SDK

-   **Agent Definition:** Define agents with clear instructions, a specific model (e.g., `gpt-4o`), and a well-defined set of tools.
-   **Tools:** Create specific, single-purpose functions as tools for the agent (e.g., a `searchApartments` tool). Ensure the function schemas (parameters, description) are clearly defined so the agent understands how to use them.
-   **Tracing:** Utilize the built-in tracing capabilities to debug and understand the agent's reasoning process during development.

### Firecrawl

-   **Error Handling:** Implement robust error handling and retry logic for all Firecrawl API calls to handle potential network issues or scraping failures.
-   **Selective Scraping:** Be specific about the data you need to extract to minimize the amount of data processed and reduce costs.

---

## Rationale for a Unified Stack

Our primary choice is a unified **Next.js and Supabase** stack. This approach is modern, efficient, and provides all the tools we need to build and deploy this project with a single, consistent language and framework. While a separate Python backend is a valid alternative (especially for highly complex, standalone AI services), the unified stack simplifies development and deployment. We can always migrate to a separate Python backend in the future if the project's complexity grows to demand it.
