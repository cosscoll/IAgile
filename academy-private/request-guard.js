// Prevent older network responses from rendering after navigation or a session change.
// Authorization is still enforced by Supabase RLS; this only protects the browser view.
export function createRequestGuard() {
  let currentVersion = 0;
  return {
    next() { currentVersion += 1; return currentVersion; },
    current() { return currentVersion; },
    valid(version) { return version === currentVersion; },
    invalidate() { currentVersion += 1; }
  };
}
