# Phase 2: Groups and Channels

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Create a “Groups Overview” page or route (e.g., app/channels/page.tsx) to list existing groups.  
[ ] FRONTEND: Implement a UI (modal or page) to create new groups.  
[ ] FRONTEND: Use Shadcn/UI components for group and channel creation forms.  
[ ] FRONTEND: Inside each group view, display a list of channels (Tailwind responsive).  
[ ] FRONTEND: Implement a flow for creating new channels (public or private) with basic form validation.  
[ ] FRONTEND: Update routes to handle patterns like /groups/[groupId]/channels/[channelId].  
[ ] FRONTEND: Ensure a consistent global sidebar or top navigation.  
[ ] BACKEND: Create Supabase tables for “groups” and “channels,” applying RLS.  
[ ] BACKEND: Link channels to groups with foreign keys and store user membership.  
[ ] BACKEND: Provide CRUD for groups/channels (Supabase client or Next.js API routes).  
[ ] BACKEND: Enforce row-level security for private channels and membership restrictions.  
[ ] FRONTEND: Write unit tests for creating groups/channels; use integration tests to check private channel visibility.  