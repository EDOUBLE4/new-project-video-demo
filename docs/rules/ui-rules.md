# UI Rules

These guidelines combine insights from [@user-flow.md](../project-info/user-flow.md), [@tech-stack.md](../project-info/tech-stack.md), and [@tech-stack-rules.md](../rules/tech-stack-rules.md), focusing on how to build an engaging, desktop-first yet responsive user interface (UI) for ChatGenius.

---

## 1. Desktop-First, Responsive Approach

1. **Layout Priority**  
   - Optimize for desktop viewports first; ensure essential features (channels, DMs, presence indicators) are clearly visible.  
   - Use Tailwind CSS breakpoints to adapt layouts for smaller screens (e.g., collap­se sidebars, reduce margin/padding).
2. **Mobile-Minded Optimizations**  
   - Collapse or hide non-critical UI elements on smaller screens.  
   - Maintain main content focus (messaging, real-time interactions) for minimal clutter.

---

## 2. Interaction & Animation

1. **Interactive Components**  
   - All tappable/clickable elements should have clear hover/focus states.  
   - Rely on Shadcn UI components where possible to ensure consistent interaction patterns.
2. **Motion & Transitions**  
   - Subtle animations (e.g., fade, slide) for state transitions (channel switching, popover menus).  
   - Keep durations short (150–300ms) to maintain a snappy feel.
3. **Real-Time Feedback**  
   - Use spinners, skeletons, or placeholders when loading messages or channels.  
   - In Supabase Realtime contexts (live status or presence updates), highlight changes with short, noticeable animations.

---

## 3. Accessibility & Design Principles

1. **Keyboard Navigation**  
   - Avoid tab trapping. Use logical tab order across interactive elements (Auth forms, channel list, DM interface).  
   - Provide “Skip to Content” or “Skip to Chat” links if multiple nav levels exist.
2. **ARIA & Semantics**  
   - Label important regions (e.g., navigation, chat input) with ARIA attributes.  
   - Ensure descriptive labeling for toggles, tooltips, and notification badges.
3. **Color Contrast**  
   - Adhere to WCAG guidelines. For text against dark backgrounds, aim for high contrast in neon or bright accents.  
   - Test text on backgrounds for color-blind accessibility.
4. **Neon & Futuristic**  
   - While the theme may use vibrant palettes, remain mindful of how neon hues appear to color-impaired users. Provide sufficient tone differences.

---

## 4. Component Structure & Organization

1. **Modular Components**  
   - Build each UI element (button groups, modals, chat bubbles) as a standalone React function.  
   - Keep logic minimal in the component; offload data fetching to Next.js server components or custom hooks.
2. **Naming & File Conventions**  
   - Group related layouts and components inside feature directories (e.g., `channels/ChannelList.tsx`, `messages/MessageBubble.tsx`).  
   - Separate logic from styles where practical (e.g., `useChannelData.ts` for data fetching, `.tsx` for UI).
3. **Shadcn Base Components**  
   - Extend Shadcn UI components for repeated patterns (popovers, dropdowns, modals) to maintain consistent feel.

---

## 5. Backend & Realtime Synergy

1. **Supabase Integration**  
   - Ensure every UI that reads or writes database content uses typed queries.  
   - Handle re-fetching or subscription updates gracefully (e.g., channel lists, user status).
2. **Realtime Awareness**  
   - Listen to channel or DM changes with Supabase Realtime hooks.  
   - Smoothly animate new messages, presence changes, or file uploads in the chat interface.

---

## 6. Performance Considerations

1. **Server Components**  
   - For heavy data fetches (channel lists, user details), use Next.js server components.  
   - Ensure minimal hydration overhead on the client.
2. **Client Components**  
   - Use client components only for interactive parts (message input, reaction menu).  
   - Memoize or lazy-load large sub-components to reduce bundle size.

---

## 7. Testing & QA

1. **Automated UI Tests**  
   - Rely on Jest for component unit tests. Consider Cypress or Playwright for integration tests.  
   - Mock or stub Supabase calls to simulate real-time interactions in a controlled environment.
2. **Visual Regressions**  
   - Use snapshot testing or dedicated visual testing tools to detect unintended styling changes.

---

These UI rules ensure that ChatGenius delivers a modern, interactive, and accessible experience. By focusing on desktop-first layouts while keeping mobile in mind, employing subtle animations, and integrating seamlessly with Supabase’s real-time features, we guarantee an engaging chat platform.
