# Phase 8: Profile & Settings

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Build a profile page (app/profile/page.tsx) or dialog to update name, avatar, and status.  
[ ] FRONTEND: Validate user input (avatar file type, name length, etc.).  
[ ] FRONTEND: Provide toggles for notifications, theme settings (“Neon Cyber,” etc.).  
[ ] FRONTEND: Add a logout button to clear state and redirect to landing page.  
[ ] BACKEND: Store user data (avatar, display name, theme preference) in a user profile table.  
[ ] BACKEND: Use RLS to ensure each user can only update their own profile.  
[ ] BACKEND: If changes require re-auth, ensure token refresh with Supabase Auth.  
[ ] BACKEND: Store notification/theme preferences persistently.  
[ ] FRONTEND: Verify data persists after logout/login cycles.  
[ ] FRONTEND: Confirm theme or notification toggles behave consistently across devices.  