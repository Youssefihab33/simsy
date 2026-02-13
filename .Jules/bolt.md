# Bolt's Journal - Critical Learnings Only

## 2025-05-14 - Critical Serialization Bottleneck
**Learning:** Found that `ShowSerializer` was calling `user.save()` for every show in a list during serialization. This converted a simple GET request into O(N) database writes, causing massive latency.
**Action:** Removed side-effects from serializers. Always move initialization or update logic to write-specific actions (POST/PUT).

## 2025-05-14 - N+1 Query Patterns in DRF
**Learning:** Many-to-Many checks (like `in_favorites`) were triggering a separate query per item in the list.
**Action:** Use `Exists` subquery annotations in the ViewSet's `get_queryset` to fetch boolean flags in a single query.

## 2025-05-14 - React Bundle Optimization
**Learning:** The initial bundle was loading all route components at once, increasing Time to Interactive.
**Action:** Implemented route-based code splitting using `React.lazy` and `Suspense`. This deferred loading of hidden routes and reduced initial load time.

## 2025-05-14 - Consolidating Logic into ViewSets
**Learning:** Moving logic from separate `APIView` classes into `ViewSet` actions allows for better reuse of optimized `get_queryset` methods (with `select_related`, `prefetch_related`, and annotations).
**Action:** Prefer ViewSet `@action`s over separate `APIView`s for model-related operations to maintain performance and consistency.

## 2025-05-14 - Redundant Data Fetching
**Learning:** Found that the application was making multiple parallel requests for the same model data (one for details, one for user status).
**Action:** Consolidate data into a single serializer and endpoint. This reduces network overhead and simplifies frontend state management.

## 2026-02-12 - VideoJS "Blinking" and Sync Issues
**Learning:** Updating the `src` of a VideoJS player on every parent render causes it to restart or "blink". Also, seeking to a saved timestamp must happen after the `loadeddata` event, both on initial load and source changes.
**Action:** Implement deep comparison for video sources in `VideoJS.jsx` and use a dedicated `applyInitialSeek` helper attached to the `loadeddata` event. Ensure hooks are called in the same order by placing memoization above loading/error returns.
