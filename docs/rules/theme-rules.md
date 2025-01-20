# Theme Rules

This document outlines the **futuristic**, **dark-mode first**, and **vibrant/neon** themes we’re adopting for ChatGenius. These guidelines complement the [@ui-rules.md](./ui-rules.md) by specifying how the visual identity should be shaped in terms of color, typography, and motion design.

---

## 1. Dark-Mode First

1. **Base Palette**  
   - Primary Background: Near-black (#121212) or dark navy.  
   - Secondary Surfaces: Dark grays or subtle gradients for panels, sidebars, and modals.  
   - Ensure text is bright enough to meet contrast standards.
2. **Inverted Light Mode**  
   - Provide an optional light mode that inverts the palette if necessary.  
   - Maintain brand identity and accent usage, but lighten backgrounds and darken text.

---

## 2. Vibrant / Neon Accents

1. **Accent Colors**  
   - Electric Blues (#00FFFF) or Neon Greens (#39FF14) for highlights, links, and active states.  
   - Secondary Accents: Vibrant Magentas (#FF00AA) or Purples (#9F00FF) for hover effects and call-to-action elements.
2. **Usage**  
   - Use neon hues sparingly to avoid visual overload.  
   - Reserve vibrant colors for interactive elements (buttons, toggles) and notification indicators.

---

## 3. Futuristic Aesthetic

1. **Typography**  
   - Choose a geometric, modern font (e.g., Orbitron, Roboto Mono, or similar) for titles or headings.  
   - Ensure body text remains highly legible (sans-serif fonts with good line spacing).
2. **Geometric Patterns & Shapes**  
   - Incorporate vector lines, grids, or faint circuitry-inspired backgrounds.  
   - Subtle overlays or glows on panel borders or active navigation items enhance the futuristic feel.
3. **Animated Surfaces**  
   - Glow or pulsating effects on major interactive UI (channel icons, chat input).  
   - Avoid excessive movement; keep transitions short to maintain overall usability.

---

## 4. Accessibility & Color Contrast

1. **High Contrast Mode**  
   - The neon theme should still pass WCAG guidelines for text legibility.  
   - Validate foreground/background combos to maintain a minimum contrast ratio of 4.5:1 for normal text.
2. **User-Customizable**  
   - Consider allowing users to tweak color intensity or brightness if neon is too bright in some environments.

---

## 5. Component-Level Integration

1. **Shadcn/UI Primitives**  
   - Extend base components (buttons, menus) with neon focus/hover states.  
   - Confirm dark mode tokens in `tailwind.config.js` align with this theme.
2. **Radix UI**  
   - Utilize Radix’s built-in theming or stateful props for consistent neon feedback on toggles, dialogs, etc.  
   - Ensure transitions match the futuristic vibe (light scaling or fade effects).

---

## 6. Motion & Micro-Interactions

1. **Depth & Illumination**  
   - Subtle glowing edges for active cards, chat bubbles, or modal outlines.  
   - Dim out inactive or background elements to keep the user’s focus on the primary action.
2. **Feedback Loops**  
   - Animate color shifts on button press, with a brief glow or flash.  
   - Provide micro-interactions (e.g., slight shakes or pulses) for errors or success states.

---

## 7. Alignment with Tech Stack

1. **Tailwind Customization**  
   - Define custom neon color variables in `tailwind.config.js`.  
   - Use responsive utility classes (e.g., `dark:bg-[#121212]`, `hover:text-[#39FF14]`).
2. **Supabase Integration**  
   - Reflect real-time changes in UI with quick color pulses or glows for new messages, presence changes, or notifications.  
   - Keep the theme consistent across all user flows (Auth pages, channel views).

---

By following these theme rules, ChatGenius will present a cohesive, **futuristic**, **dark** interface that leverages **vibrant/neon** highlights and animations—all while maintaining accessibility and performance best practices. This approach ensures consistency across components and fosters a dynamic user experience that sets the tone for ChatGenius as an innovative, modern solution.