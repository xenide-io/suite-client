export interface BrandSettingsConfig {
  /** Fallback title when the workspace has not customised one. */
  defaultTitle: string;
  /** Window event dispatched when the brand changes. */
  changedEvent: string;
}

export interface WorkspaceBrandPayload {
  brand_logo?: string | null;
  brand_title?: string | null;
  brand_show_title?: boolean;
}

export type BrandSettings = ReturnType<typeof createBrandSettings>;

export function createBrandSettings(config: BrandSettingsConfig) {
  const DEFAULT_BRAND_TITLE = config.defaultTitle;
  const BRAND_SETTINGS_CHANGED = config.changedEvent;

  interface WorkspaceBrandState {
    logo: string | null;
    title: string | null;
    showTitle: boolean;
  }

  const brandState: WorkspaceBrandState = {
    logo: null,
    title: null,
    showTitle: true,
  };

  function notifyBrandChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(BRAND_SETTINGS_CHANGED));
    }
  }

  function applyWorkspaceBrand(payload: WorkspaceBrandPayload): void {
    if ('brand_logo' in payload) {
      brandState.logo = payload.brand_logo ?? null;
    }
    if ('brand_title' in payload) {
      const title = payload.brand_title;
      brandState.title = title?.trim() ? title.trim() : null;
    }
    if ('brand_show_title' in payload && payload.brand_show_title !== undefined) {
      brandState.showTitle = payload.brand_show_title;
    }
    notifyBrandChange();
  }

  function getBrandLogo(): string | null {
    return brandState.logo;
  }

  function getCustomBrandTitle(): string | null {
    return brandState.title;
  }

  function getBrandShowTitle(): boolean {
    return brandState.showTitle;
  }

  /** Title shown in navigation — null when hidden. */
  function getDisplayBrandTitle(): string | null {
    if (!getBrandShowTitle()) return null;
    const custom = getCustomBrandTitle();
    if (custom === null) return DEFAULT_BRAND_TITLE;
    return custom || DEFAULT_BRAND_TITLE;
  }

  /** @deprecated Brand is persisted via workspace appearance API. */
  function setBrandLogo(dataUrl: string | null): void {
    brandState.logo = dataUrl;
    notifyBrandChange();
  }

  /** @deprecated Brand is persisted via workspace appearance API. */
  function setCustomBrandTitle(title: string | null): void {
    brandState.title = title?.trim() ? title.trim() : null;
    notifyBrandChange();
  }

  /** @deprecated Brand is persisted via workspace appearance API. */
  function setBrandShowTitle(show: boolean): void {
    brandState.showTitle = show;
    notifyBrandChange();
  }

  /** @deprecated Brand is persisted via workspace appearance API. */
  function resetBrandTitle(): void {
    brandState.title = null;
    brandState.showTitle = true;
    notifyBrandChange();
  }

  return {
    DEFAULT_BRAND_TITLE,
    BRAND_SETTINGS_CHANGED,
    /** @deprecated Use BRAND_SETTINGS_CHANGED */
    BRAND_LOGO_CHANGED: BRAND_SETTINGS_CHANGED,
    applyWorkspaceBrand,
    getBrandLogo,
    getCustomBrandTitle,
    getBrandShowTitle,
    getDisplayBrandTitle,
    setBrandLogo,
    setCustomBrandTitle,
    setBrandShowTitle,
    resetBrandTitle,
  };
}
