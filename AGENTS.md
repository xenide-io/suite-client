# AGENTS.md — suite-client (`@xenide-io/suite-client`)

Shared **non-UI platform** package consumed by all five ShellStack SPAs. This is
a git submodule of `apps/`; it is also published to npm.

## Scope

- Allowed: API client factory, auth return paths, workspace/access helpers,
  analytics client, query-cache persistence, cross-app sync, notifications,
  Web Push, AI job hook, companion preferences, SEO helpers, error codes.
- Not allowed: React UI/components, theme tokens, app-specific screens, or
  direct router imports. UI belongs in `the-old-ui`; routing is injected by the
  host app.

## Entry point

`src/index.ts` re-exports the public modules. Keep the boundary explicit; do not
export internal helpers accidentally.

## Commands

```bash
bun run typecheck
bun run test          # vitest
bun run lint
bun run build         # tsup dist
```

From `apps/`: `make build-suite-client`, `make sync-suite-client` (rebuild +
copy into each frontend's `node_modules`).

## Rules

- No browser-only globals at module load; guard with `typeof window`.
- Never import a router or `next/*`.
- The API client must stay app-agnostic: storage prefix, refresh path and auth
  failure handler are injected by the app.
- Analytics must no-op cleanly without a project key.
- Error codes and copy are shared product contracts; changing a code requires a
  migration note and app updates.
- Tests use Vitest; add a focused test for each new client factory or hook.
- No secrets in source; env values are injected by the host app.
