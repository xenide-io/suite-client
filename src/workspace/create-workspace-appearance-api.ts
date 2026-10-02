import type { Api } from '../api/create-api-client';
import type { WorkspaceBrandPayload } from './create-brand-settings';

export interface WorkspaceAppearanceApiConfig {
  api: Api;
  parseApiError: (res: Response) => Promise<string>;
  /** Endpoint base, e.g. `/api/turtletime/workspaces/current/appearance/`. */
  basePath: string;
  applyWorkspaceBrand: (payload: WorkspaceBrandPayload) => void;
}

export type WorkspaceTheme = 'light' | 'dark';

export interface WorkspaceAppearance {
  theme: WorkspaceTheme;
  brand_logo: string | null;
  brand_title: string | null;
  brand_show_title: boolean;
}

export type WorkspaceAppearancePatch = Partial<
  Pick<WorkspaceAppearance, 'theme' | 'brand_title' | 'brand_show_title'>
> & {
  brand_logo_file?: File;
  clear_brand_logo?: boolean;
};

export class WorkspaceAppearanceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function normalizeTheme(value: unknown): WorkspaceTheme {
  return value === 'light' ? 'light' : 'dark';
}

function parseAppearancePayload(
  data: Record<string, unknown>,
): WorkspaceAppearance {
  const raw = (data.appearance ?? data) as Record<string, unknown>;
  return {
    theme: normalizeTheme(raw.theme),
    brand_logo: (raw.brand_logo as string | null) ?? null,
    brand_title: (raw.brand_title as string | null) ?? null,
    brand_show_title: Boolean(raw.brand_show_title),
  };
}

export function createWorkspaceAppearanceApi(
  config: WorkspaceAppearanceApiConfig,
) {
  const { api, parseApiError, basePath, applyWorkspaceBrand } = config;

  async function fetchWorkspaceAppearance(): Promise<WorkspaceAppearance> {
    const res = await api.get(basePath);
    if (!res.ok) {
      throw new WorkspaceAppearanceError(await parseApiError(res), res.status);
    }
    const data = await res.json();
    return parseAppearancePayload(data);
  }

  async function updateWorkspaceAppearance(
    patch: WorkspaceAppearancePatch,
  ): Promise<WorkspaceAppearance> {
    const hasFileUpload = patch.brand_logo_file instanceof File;
    const shouldClearLogo = patch.clear_brand_logo === true;

    if (hasFileUpload || shouldClearLogo) {
      const formData = new FormData();
      if (patch.theme) formData.append('theme', patch.theme);
      if (patch.brand_title !== undefined) {
        formData.append('brand_title', patch.brand_title ?? '');
      }
      if (patch.brand_show_title !== undefined) {
        formData.append(
          'brand_show_title',
          patch.brand_show_title ? 'true' : 'false',
        );
      }
      if (hasFileUpload && patch.brand_logo_file) {
        formData.append('brand_logo', patch.brand_logo_file);
      }
      if (shouldClearLogo) {
        formData.append('clear_brand_logo', 'true');
      }

      const res = await api.patch(basePath, formData);
      if (!res.ok) {
        throw new Error(await parseApiError(res));
      }
      const data = await res.json();
      return parseAppearancePayload(data);
    }

    const res = await api.patch(basePath, {
      theme: patch.theme,
      brand_title: patch.brand_title,
      brand_show_title: patch.brand_show_title,
    });
    if (!res.ok) {
      throw new Error(await parseApiError(res));
    }
    const data = await res.json();
    return parseAppearancePayload(data);
  }

  function cacheWorkspaceAppearanceLocally(
    appearance: WorkspaceAppearance,
  ): void {
    applyWorkspaceBrand({
      brand_logo: appearance.brand_logo,
      brand_title: appearance.brand_title,
      brand_show_title: appearance.brand_show_title,
    });
  }

  return {
    WorkspaceAppearanceError,
    fetchWorkspaceAppearance,
    updateWorkspaceAppearance,
    cacheWorkspaceAppearanceLocally,
  };
}
