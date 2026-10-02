/** Copy and helpers for workspace seats vs per-app access (shared core model). */

export const WORKSPACE_SEAT_HELP =
  'Each member uses one workspace seat. Inviting someone reserves a seat until the invite is revoked or accepted.';

export const ORGANISATION_SEAT_HELP =
  'Each organisation member uses one seat across all your workspaces. One invite gives them access to every workspace in your organisation.';

export const TIDES_ACCESS_HELP = 'Tides — project management.';

export const TURTLETIME_ACCESS_HELP =
  'TurtleTime — time tracking add-on (Basic plan and above).';

export const FREE_PLAN_SEAT_HELP =
  'Free personal workspaces include one product app only. Create an organisation on ShellStack for both apps and integration.';

export function hasAppAccess(
  canAccessTurtletime: boolean,
  canAccessTides: boolean,
): boolean {
  return canAccessTurtletime || canAccessTides;
}

export function canDisableAppAccess(
  app: 'turtletime' | 'tides',
  canAccessTurtletime: boolean,
  canAccessTides: boolean,
): boolean {
  if (app === 'turtletime') return canAccessTides;
  return canAccessTurtletime;
}
