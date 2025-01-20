# Phase 3: Real-Time Messaging

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Create a ChannelFeed component (components/shared/ChannelFeed.tsx) subscribing to real-time updates.  
[ ] FRONTEND: Render messages in a scrollable view with Tailwind styling.  
[ ] FRONTEND: Show sending/loading states and handle “Enter” submission for messages.  
[ ] FRONTEND: (Optional) Add button or icon to view threaded replies in a sub-panel or modal.  
[ ] FRONTEND: Integrate an emoji picker (Shadcn popover) for reactions, animate added reactions.  
[ ] BACKEND: Set up real-time connections in lib/supabase/realtime.ts for new messages per channel.  
[ ] BACKEND: Create a “messages” table referencing “channels”; update RLS for channel members only.  
[ ] BACKEND: Insert new messages via Supabase client or Next.js API routes; include timestamps/user IDs.  
[ ] BACKEND: If threads are used, add parent_message_id logic.  
[ ] FRONTEND: Write unit tests for message insertion and verify real-time subscriptions work properly.  
[ ] BACKEND: Ensure unauthorized users cannot post to channels they don’t belong to.  