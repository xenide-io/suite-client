import { defineConfig } from 'tsup';

/**
 * `posthog-js` is a runtime dependency of the analytics module. Bundle it into
 * the dist instead of leaving it external: apps copy only this package's dist
 * into their `node_modules`, so a bare `posthog-js` import would not resolve.
 */
export default defineConfig({
  noExternal: ['posthog-js'],
});
