# Tech Stack Rules

This document references our finalized choices in [@tech-stack.md](./tech-stack.md). Below are the best practices, limitations, and conventions for each technology stack component selected for ChatGenius, along with common pitfalls to avoid.

---

## 1. Next.js

### Best Practices
- Use Server Components whenever possible for performance and ease of data fetching.  
- Leverage built-in file-based routing for clear organization.  
- Rely on Next.js APIs for serverless functions that tie directly into your pages.

### Limitations
- Serverless function cold starts can lead to latency under heavy loads.  
- Requires careful handling of environment variables (e.g., storing them in a .env file).

### Conventions
- Use TypeScript for type safety and maintainability.  
- Organize routes in the "app" directory for the Next.js App Router.  
- Store environment-specific configurations in next.config.js for all build phases.

### Common Pitfalls
- Failing to handle SSR (Server-Side Rendering) differences for libraries that don’t support server environments.  
- Overusing client-side data fetching when SSR or Static Generation might be more optimal.

---

## 2. Shadcn/UI + Tailwind CSS

### Best Practices
- Maintain a consistent design system by using Shadcn’s preconfigured components.  
- Use Tailwind’s utility classes for rapid styling, ensuring a “mobile-first” approach in breakpoints.  
- Customize Shadcn UI tokens (like spacing, colors) to match project branding.

### Limitations
- Complex, dynamic styling may require additional inline overrides or custom CSS if utility classes are insufficient.  
- Large, nested components can get verbose if not kept modular.

### Conventions
- Keep component files small and reusable, splitting them by function or purpose.  
- Maintain a consistent color scheme in Tailwind’s config (tailwind.config.js).  
- Favor built-in classes over arbitrary style creation to preserve visual consistency.

### Common Pitfalls
- Overriding default component behaviors in Radix can be tricky; always check Shadcn UI docs before customizing deeply.  
- Excessive custom class usage can degrade maintainability; consider extracting partials or employing Tailwind variants.

---

## 3. Supabase (Database & Authentication)

### Best Practices
- Use row-level security (RLS) with policies for robust access control.  
- Employ Supabase Auth for consistent, secure user management.  
- Keep schema migrations versioned and documented.

### Limitations
- Supabase’s free tier has limitations on concurrent connections and storage.  
- Realtime features rely on database triggers; extremely high throughput use-cases may require caution.

### Conventions
- Store connection strings and secrets in environment variables (never commit them to source control).  
- When interfacing with the database, use TypeScript definitions to ensure type safety for queries.  
- Create structured queries for search to leverage PostgreSQL’s built-in indexing capabilities.

### Common Pitfalls
- Inadvertently disabling RLS policies can lead to unauthorized data exposure.  
- Overloading the Realtime service with complex triggers or heavy-volume channels.

---

## 4. AWS (Deployment & Hosting)

### Best Practices
- Leverage AWS managed services (e.g., ECS Fargate, RDS, or Lambda) to reduce ops overhead.  
- Use Infrastructure as Code (IaC) tools (e.g., AWS CDK, Terraform) for repeatable deployments.  
- Configure auto-scaling for peak traffic events.

### Limitations
- Setup can be more complex than managed hosting solutions (e.g., Vercel).  
- Costs can grow quickly if resource usage isn’t monitored or configured properly.

### Conventions
- Always lock down IAM roles with the principle of least privilege.  
- Group related services (e.g., load balancers, containers) under the same stack or module for easier management.  
- Keep logs in CloudWatch or a dedicated third-party service to track errors.

### Common Pitfalls
- Misconfigured security groups can expose endpoints to the public internet.  
- Neglecting to set up cost alerts might lead to surprise bills when traffic spikes.

---

## 5. Jest (Testing & QA)

### Best Practices
- Write pure functions that are easily testable.  
- Include coverage thresholds to maintain consistent test quality.  
- Run tests in CI pipelines to prevent regressions.

### Limitations
- Jest alone won’t cover E2E scenarios; pair it with Cypress or Playwright for integration tests.  
- Large test suites can slow down incremental builds if not optimized (e.g., using --detectOpenHandles).

### Conventions
- Place test files adjacent to the code under test (e.g., component.test.tsx beside component.tsx).  
- Use descriptive test and describe block names for clarity.  
- Mock external services (e.g., database calls) to keep tests deterministic.

### Common Pitfalls
- Over-reliance on mocks can hide real integration issues.  
- Skipped tests can accumulate, leading to coverage gaps.

---

## 6. Built-In Supabase Full Text Search

### Best Practices
- Use PostgreSQL indexes (GIN/GIST) for efficient text search on large datasets.  
- Test queries regularly to ensure relevant results across varying data sizes.  
- Combine partial matching with filters where appropriate for more precise results.

### Limitations
- Less advanced than dedicated search engines (e.g., Elasticsearch) for highly complex queries or huge datasets.  
- Maintaining advanced ranking or fuzzy matching may require manual setup or custom indexing.

### Conventions
- Normalize search text and handle multi-language support through PostgreSQL’s built-in text search configurations.  
- Use column weighting (e.g., ts_rank) for more accurate results.  
- Keep track of changes to text fields to ensure indexes remain efficient.

### Common Pitfalls
- Ignoring language settings can degrade the quality of search results.  
- Overcomplicating queries without analyzing performance leads to slow lookups under load.

---

These guidelines outline the crucial details for utilizing our chosen tech stack optimally. Each section provides a robust foundation for development, deployment, and maintenance, reducing potential errors and aligning ChatGenius with industry-standard practices.