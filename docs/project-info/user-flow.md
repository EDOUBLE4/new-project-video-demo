# User Flow

This document outlines the journey a user takes through ChatGenius, based on the core features underlined in [@project-overview.md](../project-info/project-overview.md). It will guide the architecture and UI design by detailing how each feature connects.

## 1. Authentication & Onboarding
1. **Sign Up / Login**  
   - Users visit the login page and authenticate using standard credentials or SSO integrations.  
   - Successful authentication redirects them to the home interface where they see available channels or groups.

2. **Initial Setup**  
   - After logging in, new users complete a brief onboarding:  
     - Customize profile details (name, status).  
     - Choose default channels or groups to join.

## 2. Groups and Channels
1. **View Available Groups**  
   - Users see a list of groups (e.g., teams or departments).  
   - They can select a group to view its channels.

2. **Channel Discovery & Organization**  
   - Channels are displayed within each group.  
   - Channels may be open (public) or invite-only (private).  
   - Users can join public channels directly.  
   - Private channels require an invitation.

3. **Channel Navigation**  
   - Upon joining a channel, users see a real-time message stream.  
   - Upcoming events, pinned files, or channel announcements appear prominently.

## 3. Real-Time Messaging & Threading
1. **Composing Messages**  
   - Users type messages in a dedicated input box and can post them instantly.  
   - Messages (including text, images, or files) are broadcast in real-time to all channel members.

2. **Thread Support**  
   - Hovering or clicking on a message reveals options to reply in a thread.  
   - Threaded replies stay grouped under the original message, maintaining context.

3. **Emoji Reactions**  
   - Users can react to messages or threads with emojis.  
   - Reactions appear beneath the message, providing quick feedback without creating clutter.

## 4. Direct Messages (DMs)
1. **Initiate DMs**  
   - Users can search for a specific colleague or group of colleagues to start private conversations.

2. **Realtime Updates**  
   - Similar to channels, DMs update in real-time, enabling immediate and private communication.

## 5. File Sharing & Search
1. **File Upload**  
   - Within channels or DMs, users can upload files and share them.  
   - Files are stored and referenced in the message thread for easy retrieval.

2. **Search Functionality**  
   - A global search bar allows users to locate messages, channels, or shared files quickly.  
   - Search results display context, linking back to the relevant channel or DM thread.

## 6. User Presence & Status
1. **Presence Indicators**  
   - Each user has a presence indicator (e.g., online, away, busy).  
   - Team members see this status next to names in channel rosters or DM lists.

2. **Custom Status**  
   - Users can set custom status messages (e.g., “In a meeting,” “On vacation”).

## 7. Notifications & Alerts
1. **In-App Notifications**  
   - Users receive alerts for mentions, thread replies, or direct messages.  
   - Notifications are displayed via badges or toast messages.

2. **Desktop / Mobile Notifications**  
   - When enabled, the app can push system-level notifications for critical messages, ensuring timely responses.

## 8. Logging Out
1. **Session Management**  
   - Users can log out from their account, invalidating the session and ensuring security.

2. **Re-Authentication**  
   - Future logins require credentials again, following secure authentication flow.

---

This user flow provides a high-level map of how features fit together to provide a smooth user experience—from sign-up and channel selection, to real-time communication and secure file sharing. It serves as a foundation for designing both the back-end architecture (e.g., database schema, WebSocket connections) and the front-end UI (group and channel layouts, message threads, notifications, etc.).