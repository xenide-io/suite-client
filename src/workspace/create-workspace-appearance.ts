export interface WorkspaceAppearanceConfig {
  /** Window event dispatched when the active workspace changes. */
  changedEvent: string;
  /** localStorage base key for the theme. */
  themeStorageBase: string;
  /** Reads the active workspace id from the app's API client. */
  getActiveWorkspaceId: () => string | null;
}

export type WorkspaceAppearanceHelpers = ReturnType<
  typeof createWorkspaceAppearance
>;

export function createWorkspaceAppearance(config: WorkspaceAppearanceConfig) {
  const WORKSPACE_CHANGED = config.changedEvent;
  const THEME_STORAGE_BASE = config.themeStorageBase;

  function notifyWorkspaceChanged(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(WORKSPACE_CHANGED));
    }
  }

  function scopedStorageKey(
    base: string,
    workspaceId?: string | null,
  ): string {
    const wsId = workspaceId ?? config.getActiveWorkspaceId();
    return wsId ? `${base}:${wsId}` : base;
  }

  function getScopedStorageItem(
    base: string,
    workspaceId?: string | null,
  ): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const scoped = localStorage.getItem(scopedStorageKey(base, workspaceId));
      if (scoped !== null) return scoped;
      const wsId = workspaceId ?? config.getActiveWorkspaceId();
      if (wsId) {
        return localStorage.getItem(base);
      }
      return null;
    } catch {
      return null;
    }
  }

  function setScopedStorageItem(
    base: string,
    value: string | null,
    workspaceId?: string | null,
  ): void {
    if (typeof window === 'undefined') return;
    const key = scopedStorageKey(base, workspaceId);
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  return {
    WORKSPACE_CHANGED,
    THEME_STORAGE_BASE,
    notifyWorkspaceChanged,
    scopedStorageKey,
    getScopedStorageItem,
    setScopedStorageItem,
  };
}
