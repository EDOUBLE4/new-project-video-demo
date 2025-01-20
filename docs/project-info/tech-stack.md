# Tech Stack Options

This document outlines the chosen technologies to power ChatGenius, referencing the needs identified in [@project-overview.md](./project-overview.md) and [@user-flow.md](./user-flow.md).

---

## 1. Frontend + Server-Side Rendering

- **Next.js**  
  - React-based, offers hybrid static & server-side rendering  
  - Seamless file-based routing  
  - Built-in API routes

## 2. UI Components + Styling

- **Shadcn/UI + Tailwind CSS**  
  - Shadcn/UI: Pre-built headless components powered by Radix  
  - Tailwind: Utility-first CSS for rapid UI development  
  - Native theming & responsive classes

## 3. Database & Authentication

- **Supabase**  
  - Managed PostgreSQL database with built-in Auth & Realtime capabilities  
  - Seamless integration with TypeScript and Next.js

## 4. Realtime Messaging

- **Supabase Realtime**  
  - Built in with Supabase's PostgreSQL triggers and websockets  
  - Minimal setup as part of Supabase ecosystem

## 5. Deployment & Hosting

- **AWS (Amazon Web Services)**  
  - Offers granular control over cloud resources (EC2, Lambda, RDS)  
  - Extensive scalability options and global infrastructure

## 6. Testing & QA

- **Jest**  
  - Easy TypeScript setup  
  - Well-maintained and popular in the React ecosystem

## 7. Search / Indexing

- **Built-In Supabase Full Text Search**  
  - Native PostgreSQL full-text search capabilities  
  - Seamless integration with existing Supabase setup  
  - Suitable for basic to moderate search requirements

---

This overview represents the final technology choices for ChatGenius. These selections prioritize ecosystem compatibility, particularly around Supabase as the core backend service.