## 2025-05-23 - SPA-compliant Navigation & Accessible Cards
**Learning:** This codebase had a pattern of using `location.href` for navigation, causing full-page reloads and breaking the SPA experience. Additionally, many interactive icons were non-semantic `<span>` tags without keyboard focus or ARIA labels.
**Action:** Always prefer `useNavigate` from `react-router-dom` or MUI `Link` with `component={RouterLink}` for internal navigation. Refactor non-semantic interactive icons into MUI `IconButton` with `Tooltip` and `aria-label` to improve accessibility and provide immediate user feedback.

## 2025-05-23 - "Simple and Transparent" Redesign & Interactive Delight
**Learning:** A "Simple and Transparent" UI can be achieved through consistent use of `backdrop-filter: blur()`, subtle borders, and a unified dark theme. Adding micro-interactions like an animated face that responds to user input (typing/hiding eyes) significantly increases user delight and makes forms feel more alive.
**Action:** Use `backdrop-filter` and low-opacity backgrounds for a modern "glass" effect. Implement characterful micro-interactions (like SVG-based animated faces) to provide visual feedback during sensitive actions like password entry.

## 2025-05-23 - Cursor Tracking for Interactive Elements
**Learning:** Adding a global `mousemove` listener to interactive SVG components (like the `AnimatedFace`) creates a highly engaging and responsive experience. Normalizing vectors from the component center to the cursor allows for smooth, limited-range movement (like eyes looking around) without breaking the aesthetic.
**Action:** Use `useEffect` to attach/detach global mouse move listeners for interactive visual components. Use state precedence (e.g., hiding > typing > tracking) to ensure the component behaves logically during different user interactions.
