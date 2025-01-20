# Codebase Best Practices

This document aggregates principles from [@tech-stack.md](../project-info/tech-stack.md), [@tech-stack-rules.md](./tech-stack-rules.md), [@ui-rules.md](./ui-rules.md), and [@theme-rules.md](./theme-rules.md) to define how we structure, name, and comment our files. It also sets guidelines for file size limits to optimize maintainability and AI tooling support (e.g., Cursor’s AI tools).

---

## 1. General Principles

1. **Modularity & Scalability**  
   - Keep features isolated; each module or feature should reside in its own directory with minimal cross-dependencies.  
   - Avoid large, monolithic files—this preserves clarity and maintainability.

2. **High Navigability**  
   - Group files logically (e.g., `ui`, `auth`, `database`) for quick reference.  
   - Leverage a consistent folder structure across the codebase.

3. **File Size Limit (≤ 250 Lines)**  
   - All source files must remain under 250 lines.  
   - If a file grows beyond this, split logic into smaller components, utilities, or hooks.

4. **File Comment Headers**  
   - Begin each file with a concise explanation of its role in the application.  
   - State the primary function(s) and data structures included, plus references to relevant modules.

5. **Function Documentation**  
   - For each function, use JSDoc/TSDoc comments explaining:  
     - Purpose (one-liner summary)  
     - Parameters (names, types, descriptions)  
     - Return type (if applicable)  
   - Example (TSDoc style):
     ```ts
     /**
      * Fetches user data from the Supabase Users table.
      * @param userId - unique ID of the requested user
      * @returns Promise containing user data
      */
     ```
6. **Naming Conventions**  
   - Use `kebab-case` or `snake_case` for folder names (preferences vary, but must be consistent).  
   - Use `camelCase` or `PascalCase` for file names when appropriate (e.g., React components in PascalCase).  
   - Keep names unambiguous and descriptive (avoid single-letter or cryptic file names).

---

## 2. Proposed Folder Structure

Below is an example file tree illustrating how we may organize the project. This reflects our Next.js App Router approach and references from the UI, theme, and real-time features. Directories and files are representative only—adapt as the project evolves.

```
c:\Users\palme\Desktop\Coding\Gauntlet\new-project-demo
├─ app
│  ├─ (root)
│  │  ├─ layout.tsx           // Main layout (header, footer, theme setup)
│  │  └─ page.tsx             // Landing page or default home
│  ├─ auth
│  │  ├─ layout.tsx           // Auth-specific layout
│  │  └─ page.tsx             // Login/SignUp logic, uses Supabase Auth
│  ├─ channels
│  │  ├─ layout.tsx           // Channel Listing, sub-layout for shared sidebars
│  │  └─ page.tsx             // Channel feed, real-time messaging components
│  └─ dms
│     ├─ layout.tsx           // DM wrapper
│     └─ page.tsx             // Direct messages UI
│
├─ components
│  ├─ ui
│  │  ├─ Button.tsx           // Shadcn/UI-based button
│  │  ├─ Modal.tsx            // Customizable modal
│  │  └─ ... (other UI elements)
│  ├─ layout
│  │  ├─ Navbar.tsx           // Global navigation bar
│  │  ├─ Sidebar.tsx          // Channel or DM list
│  │  └─ ...
│  └─ shared
│     └─ MessageBubble.tsx    // Chat message bubble
│
├─ lib
│  ├─ supabase
│  │  ├─ client.ts            // Supabase client initialization
│  │  ├─ auth.ts              // Auth-related methods or hooks
│  │  └─ realtime.ts          // Realtime channel/presence methods
│  ├─ utils
│  │  ├─ formatDate.ts        // Date formatting utilities
│  │  └─ ... (other pure utility functions)
│  └─ validations
│     ├─ userSchemas.ts       // Zod or similar validation schemas
│     └─ ...
│
├─ styles
│  ├─ globals.css             // Tailwind base imports, global resets
│  ├─ theme.css               // Potential overrides or theme tokens
│  └─ ... (additional theme-specific overrides)
│
├─ tests
│  ├─ unit
│  │  └─ ... (Jest unit tests for utilities, hooks, etc.)
│  ├─ integration
│  │  └─ ... (Cross-component or server tests)
│  └─ e2e
│     └─ ... (Cypress or Playwright tests)
│
├─ docs
│  ├─ project-info
│  │  └─ ... (existing markdown docs such as tech-stack.md)
│  └─ rules
│     ├─ ui-rules.md
│     ├─ theme-rules.md
│     ├─ tech-stack-rules.md
│     └─ ... (this file: codebase-best-practices.md, etc.)
│
├─ .env.example               // Sample environment variables
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
└─ README.md
```

### Notes on Structure

- **app/**: Next.js App Router structure with nested routes and layout files.  
- **components/**: Reusable UI elements. We separate them into `ui`, `layout`, `shared` for clarity.  
- **lib/**: Contains code that can be reused globally—Supabase clients, utility functions, validations.  
- **styles/**: Tailwind, global CSS, theme definitions.  
- **tests/**: Organizes tests by unit, integration, or E2E for clarity.  
- **docs/**: Contains our markdown documentation, from project info to coding rules.

---

## 3. Implementation Guidelines

1. **Line Limits**  
   - Extract submodules or additional hooks if any file approaches 250 lines.  
   - Keep each function short and focused.

2. **Commentation**  
   - Provide a single-line summary at the file’s top describing its purpose.  
   - Use TSDoc for function documentation—this helps with auto-generated docs and IDE hints.

3. **Styling Implementation**  
   - Refer to [@ui-rules.md](./ui-rules.md) for layout specifics and responsiveness.  
   - Respect [@theme-rules.md](./theme-rules.md) for color usage and neon/futuristic design patterns.

4. **Integration with Tech Stack**  
   - Always follow [@tech-stack-rules.md](./tech-stack-rules.md) to ensure consistent usage of Supabase, Next.js, and Tailwind.  
   - Keep environment variables safe and never commit real credentials.

5. **Review & Refine**  
   - Periodically review structure to remove dead code, reorganize if features become too large, and adapt to new Next.js or Supabase releases.  
   - Evolve test coverage in parallel to code changes.

---

## 4. Summary

By adhering to these best practices—maintaining a clear file structure, capping file sizes, using thorough comments, and acknowledging the rules from our tech stack and UI/theme docs—we ensure that ChatGenius remains:

- Intuitive for new developers to onboard  
- Scalable for future feature expansions  
- Easier to maintain with AI-based developer tools

These guidelines should be consulted and refined on a regular basis, especially as ChatGenius evolves with more features and user feedback.