# Phase 6: User Presence & Status

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Display status icons (online/away/offline) next to user avatars in channels/DMs.  
[ ] FRONTEND: Show real-time updates when users connect/disconnect, ensuring accessibility with color.  
[ ] FRONTEND: Provide a settings UI (popover or modal) to set custom status (“In a meeting,” etc.).  
[ ] FRONTEND: Optimize re-renders with caching or memoization.  
[ ] BACKEND: Use Supabase Realtime presence channels to track user connect/disconnect events.  
[ ] BACKEND: Optionally store status messages in a dedicated table so they persist after logout.  
[ ] BACKEND: Implement logic to push presence changes to relevant channels/DMs.  
[ ] FRONTEND: Test presence reliability during sign-in, sign-out, and inactivity.  
[ ] BACKEND: Confirm correct RLS so only each user can set their own status.  