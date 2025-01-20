# Phase 7: Notifications

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Add a notification/toast component to display mentions or new message alerts.  
[ ] FRONTEND: Show unread badges or counts in channel/DM sidebars.  
[ ] FRONTEND: Add a settings toggle to enable/disable notifications.  
[ ] FRONTEND: Detect @mentions in incoming messages and highlight them.  
[ ] FRONTEND: Ensure minimal or banner-style notifications on mobile.  
[ ] BACKEND: Update Supabase records to track unread counts for each user and channel.  
[ ] BACKEND: If advanced mention logic is needed, store references to mentioned user IDs.  
[ ] BACKEND: Sync unread states across devices; mark read once channel or DM is opened.  
[ ] FRONTEND: Write tests confirming unread increments and mention detection.  
[ ] BACKEND: Validate mention logic for multiple or partial user names.  