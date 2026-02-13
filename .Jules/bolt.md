## 2025-05-22 - Optimizing Video Playback and Show Details
**Learning:** React hooks (like `useMemo`, `useCallback`) must always be placed before any conditional early returns (e.g., `if (loading) return ...`). Placing them after can cause inconsistent hook ordering and application crashes when the component transitions from a loading to a loaded state.
**Action:** Always audit hook placement during component refactoring, especially when adding memoization to data-heavy detail pages.

**Learning:** For VideoJS, seeking to a specific time immediately on `ready` can be unreliable if the source is still being initialized. Listening for the `loadeddata` event ensures the player is ready to accept seek commands, preventing the "seek to 0" bug on initial load.
**Action:** Use `player.one('loadeddata', ...)` for initial seek operations in VideoJS wrappers.

**Learning:** Backend N+1 query problems in Django ViewSets can be effectively eliminated by overriding `get_queryset` to include `prefetch_related` for all nested fields used in serializers, even those with `depth > 0`.
**Action:** Proactively check `django-debug-toolbar` or query counts when serializers include multiple related models.

**Learning:** When adding features to "reset" or "clear" data (like "Mark as unwatched"), ensure the backend action explicitly deletes the relevant keys from JSONFields to maintain a clean database state and prevent stale data from affecting UI indicators like "watched" checkmarks.
**Action:** Use `del dictionary[key]` for JSONField updates in Django when the goal is to fully remove an entry.
