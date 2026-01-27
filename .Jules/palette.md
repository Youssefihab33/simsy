## 2025-05-23 - SPA-compliant Navigation & Accessible Cards
**Learning:** This codebase had a pattern of using `location.href` for navigation, causing full-page reloads and breaking the SPA experience. Additionally, many interactive icons were non-semantic `<span>` tags without keyboard focus or ARIA labels.
**Action:** Always prefer `useNavigate` from `react-router-dom` or MUI `Link` with `component={RouterLink}` for internal navigation. Refactor non-semantic interactive icons into MUI `IconButton` with `Tooltip` and `aria-label` to improve accessibility and provide immediate user feedback.
