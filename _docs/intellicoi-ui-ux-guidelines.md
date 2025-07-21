```markdown
# Agentic-First UI/UX Guidelines - IntelliCOI Platform

## Core Principles
- **Accuracy Builds Trust** - Show confidence scores and be transparent about AI processing
- **Speed to Compliance** - Every click should move toward vendor compliance
- **Clarity Over Cleverness** - Insurance is complex; UI should be simple
- **Vendor-Friendly** - Remember vendors didn't choose this software

## Design System

### Visual Identity
- **Primary Colors**: 
  - Blue #2563EB (trust, professionalism)
  - Green #10B981 (compliance, success)
  - Red #EF4444 (gaps, warnings)
  - Gray #6B7280 (secondary text)
- **Typography**: Inter for UI, SF Mono for data
- **Spacing System**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Border Radius**: 6px (modern but not too playful)
- **Shadows**: Subtle elevation (shadow-sm, shadow, shadow-md)

### Design Tokens
```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-success: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  
  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Monaco', monospace;
  --font-size-base: 16px;
  
  /* Spacing */
  --spacing-unit: 4px;
  
  /* Animations */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
}
Key UI Components
COI Upload Area (Priority 1)

Purpose: Accept COI documents with confidence
Key Features: Drag-drop, progress indicator, format validation
Interactions: Animated drop zone, real-time file validation
Update Frequency: Real-time progress during processing

Compliance Dashboard (Priority 1)

Purpose: Show vendor compliance at a glance
Key Features: Overall %, problem vendors, expiring soon
Visual Style: Clean cards with clear metrics
Accessibility: Colorblind-friendly status indicators

Gap Analysis Display (Priority 1)

Purpose: Show coverage gaps clearly
Data Shown: Required vs Actual, specific gaps, fix instructions
User Actions: Download instructions, email vendor, mark resolved
States: Processing, complete, error, requires review

Interaction Patterns
Real-time Feedback

Processing spinner with status messages
Confidence score during extraction
Success animations on compliance
Clear error messages with next steps

Navigation

Primary Nav: Dashboard, Vendors, Documents, Settings
Secondary Nav: Filters and search within sections
Mobile Strategy: Bottom tab bar for main sections
Keyboard Shortcuts:

Cmd/Ctrl + U - Upload COI
Cmd/Ctrl + K - Quick search
V - View vendors
? - Show shortcuts



Data Visualization

Charts: Simple bar charts for compliance trends
Tables: Sortable vendor lists with inline actions
Metrics: Large, clear numbers with trend indicators
Timelines: Visual expiration calendar

Responsive Design
Breakpoints
css/* Mobile First */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Wide desktop */
Mobile Considerations

One-thumb operation for key actions
Camera upload prominent on mobile
Simplified dashboard for small screens
Touch targets: minimum 44px

Accessibility Requirements
WCAG Compliance

Level: AA
Color Contrast: 4.5:1 minimum
Focus Indicators: 2px solid outline
Screen Reader: Full ARIA labels

Keyboard Navigation

Tab order follows visual hierarchy
Skip to main content link
Escape closes modals
Enter submits forms

Performance Guidelines
Loading Performance

First paint: <1.5s
Interactive: <3s
Bundle size: <300KB initial
Image optimization: WebP with fallbacks

Runtime Performance

60fps scrolling
Debounced search inputs
Virtual scrolling for long lists
Optimistic UI updates

AI-Specific UI Patterns
AI Transparency

Show extraction confidence percentage
Indicate which fields were AI-extracted
"Why this gap?" explanations
Allow manual corrections

AI Feedback

Thumbs up/down on instructions
"Was this helpful?" after actions
Flag incorrect extractions
Improve model with feedback

Component Library
Base Components
jsx// COI Status Badge
export const ComplianceStatus = ({ 
  status, 
  percentage 
}: ComplianceStatusProps) => {
  const colors = {
    compliant: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800'
  }
  
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {percentage}% Compliant
    </div>
  )
}
Composite Components

Upload Zone: Combines drop area, file validation, progress
Vendor Card: Shows compliance status, actions, timeline
Gap Analysis: Table with visual indicators and actions

Animation Guidelines
Micro-interactions

Hover: Subtle scale (1.02) and shadow
Click: Brief scale down (0.98)
Loading: Smooth pulse animation
Success: Check mark draw animation

Page Transitions

Fade between routes (200ms)
Slide panels from right
Fade + scale for modals
Stagger list item animations

Copy Guidelines
Voice and Tone

Personality: Professional but approachable
Technical Level: Explain insurance terms simply
Error Messages: "We couldn't process this COI. Try a clearer image."
Empty States: "No vendors yet. Upload your first COI to get started!"

Microcopy Examples

Button: "Upload COI" not "Submit Document"
Placeholder: "Search by vendor name or policy number"
Tooltip: "General Liability should be at least $1M"
Success: "✓ Vendor compliant! They'll receive confirmation."

Testing Guidelines
Usability Testing

Upload flow with real property managers
Vendor portal with confused contractors
Success metrics: Time to first compliance
Iteration cycle: Weekly during MVP

A/B Testing

Confidence score display format
Instruction email templates
Success criteria: Vendor compliance rate
Test duration: 2 weeks minimum

Implementation Notes
CSS Architecture

Methodology: Utility-first with Tailwind
Component classes for complex patterns
CSS variables for design tokens
Mobile-first responsive approach

Component Architecture

Server components by default
Client components for interactivity
Suspense boundaries for loading states
Error boundaries for AI failures

Dark Mode Considerations

Preserve color meaning (red = gap)
Adjust shadows for dark backgrounds
Ensure chart readability
Default to system preference

Remember

Property managers are busy - respect their time
Vendors need clarity - they're confused already
Show progress - AI processing takes time
Build trust - accuracy matters more than speed

Agent Instructions
When implementing these guidelines:

Start with the simplest version that works
Add polish iteratively based on user feedback
Maintain consistency across all components
Test with real data, not lorem ipsum
Optimize for the primary use case first