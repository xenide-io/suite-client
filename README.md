# @xenide-io/suite-client

Framework-agnostic platform layer shared across the Xenide ShellStack apps
(TurtleTime, Tides, ShellStack, Kraken, Shelly). The UI counterpart lives in
[`@xenide-io/the-old-ui-theme`](https://www.npmjs.com/package/@xenide-io/the-old-ui-theme);
this package deliberately contains **no visual components**.

## What's here

| Area | Exports |
| --- | --- |
| Errors | `ERROR_CODES`, `normalizeError`, `appErrorFromResponse`, `formatAppError` |
| API client | `createApiClient(config)` — fetch, JWT refresh, `X-Active-Workspace-Id`, shared workspace cookie |
| Auth | `createAuthReturnPath(config)` — return paths, portal handoff, redeem |
| Workspace | `createBrandSettings`, `createWorkspaceAppearance`, `createWorkspaceAppearanceApi`, seat/subscription helpers |
| Cross-app sync | `createCrossAppSync(config)`, `createLiveRefresh(sync)` |
| Notifications | `createNotificationsClient({ api, parseApiError })` |
| AI jobs | `activeSuiteAiJobs`, `sortedSuiteAiEvents`, `suiteAiEventSummary` |
| Webhooks | `WEBHOOK_ACTIVITY_ACTIONS`, `webhookActionsToSelected`, `selectedToWebhookActions` |
| SEO | `createJsonLd(config)` |
| Hooks | `useIsNight()` |

## Usage

Each app owns a thin `lib/api-client.ts` that configures the shared factory, so
existing imports keep working:

```ts
import { createApiClient } from '@xenide-io/suite-client';

export const {
  api,
  parseApiError,
  getAccessToken,
  setTokens,
  // ...
} = createApiClient({
  storagePrefix: 'tt',
  refreshPath: '/api/turtletime/auth/refresh/',
});
```

## Scripts

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Releasing

Publishing runs from GitHub Actions on a published GitHub Release using npm
trusted publishing (OIDC) — see `.github/workflows/release.yml`. Bump
`version`, tag `vX.Y.Z`, publish the release.
