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
