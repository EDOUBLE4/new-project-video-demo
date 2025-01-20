# Phase 5: File Sharing & Search

Below is a single, flattened list of actionable steps. Mark each item as completed ([x]) when done, prefixed with FRONTEND or BACKEND.

---

## Checklist

[ ] FRONTEND: Add an “Upload File” button or drag-and-drop area to channel/DM message inputs.  
[ ] FRONTEND: Show upload progress, success, or error states.  
[ ] FRONTEND: Render file thumbnails (images) or icons (other types), possibly with tooltips or popovers.  
[ ] FRONTEND: Create a search bar/component to query messages, channels, users, and file metadata.  
[ ] FRONTEND: Display search results in a dropdown or separate page, highlighting matching text.  
[ ] BACKEND: Configure a Supabase storage bucket for file uploads, ensuring secure, signed URLs if private.  
[ ] BACKEND: Link file records to messages in an “attachments” table or a column in “messages.”  
[ ] BACKEND: Use Postgres indices or tsvector for full-text/partial search on relevant fields.  
[ ] FRONTEND: Write tests to confirm file upload flows, search queries, and edge cases (e.g. partial terms).  
[ ] BACKEND: Verify only authorized users can access or download private files.  