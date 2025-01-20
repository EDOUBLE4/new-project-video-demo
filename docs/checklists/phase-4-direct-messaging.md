# Phase 4: Direct Messages (DMs)

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Create a dedicated “DMs” section or page (app/dms/page.tsx).  
[ ] FRONTEND: Provide a user selector (Shadcn/UI combobox or search) to initiate new DMs.  
[ ] FRONTEND: Display existing DM conversations with unread indicators.  
[ ] FRONTEND: Reuse or adapt ChannelFeed for private 1:1/group DMs, showing avatars/presence.  
[ ] FRONTEND: Ensure responsiveness (mobile-first) for DM lists and conversations.  
[ ] BACKEND: Create a “direct_messages” table (or DM room table) in Supabase referencing user IDs.  
[ ] BACKEND: Set up real-time subscriptions so only participants get updates.  
[ ] BACKEND: Update RLS to ensure only DM participants can access messages.  
[ ] FRONTEND: Test DM flow from user initiation to real-time conversation updates.  
[ ] BACKEND: Validate secure data handling so no outside users see DM history.  