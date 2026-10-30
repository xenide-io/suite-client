import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_COMPANION,
  readCompanionAppearance,
  mergeCompanionAppearance,
  type CompanionApp,
  type CompanionAppearance,
  type CompanionAppearancePatch,
  type CompanionPreferences,
} from "./companion";

type AppearanceApi = {
  get(path: string, init?: RequestInit): Promise<Response>;
  patch(path: string, body: unknown, init?: RequestInit): Promise<Response>;
};
const PATH = "/api/ai/companion-preferences";

/** One account document across all origins; app JWTs remain separate and host-owned. */
export function useCompanionPreferences({
  accountId,
  app,
  api,
  onChange,
}: {
  accountId: string;
  app: CompanionApp;
  api: AppearanceApi;
  onChange?(patch: Partial<CompanionPreferences>): void;
}) {
  const key = `shellstack:companion:v2:${accountId}`;
  const [appearance, setAppearance] = useState<CompanionAppearance>(() => {
    try {
      return readCompanionAppearance(
        JSON.parse(localStorage.getItem(key) ?? "null"),
      );
    } catch {
      return { ...DEFAULT_COMPANION, apps: {} };
    }
  });
  const current = useRef(appearance);
  const revision = useRef(0),
    pending = useRef(0),
    alive = useRef(true);
  const queue = useRef(Promise.resolve());
  const failed = useRef<CompanionAppearancePatch | null>(null);
  const [syncStatus, setSyncStatus] = useState("Loading saved appearance…");
  const [syncError, setSyncError] = useState("");
  const apply = useCallback(
    (value: CompanionAppearance) => {
      current.current = value;
      if (!alive.current) return;
      setAppearance(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* optional cache */
      }
    },
    [key],
  );

  const save = useCallback(
    (patch: CompanionAppearancePatch) => {
      revision.current++;
      pending.current++;
      setSyncStatus("Saving across apps…");
      setSyncError("");
      queue.current = queue.current
        .catch(() => {})
        .then(async () => {
          if (!alive.current) {
            pending.current--;
            return;
          }
          const toSave = {
            ...failed.current,
            ...patch,
            apps: { ...failed.current?.apps, ...patch.apps },
          };
          try {
            const response = await api.patch(PATH, toSave, { keepalive: true });
            if (!response.ok)
              throw new Error(
                "Appearance could not be saved. Your changes are only on this device until you retry.",
              );
            const data = (await response.json()) as {
              preferences: CompanionAppearance;
            };
            if (!data.preferences)
              throw new Error("The server did not return saved appearance.");
            if (alive.current && pending.current === 1)
              apply(readCompanionAppearance(data.preferences));
        failed.current = null;
        if (alive.current) setSyncError("");
          } catch (error) {
            failed.current = toSave;
            if (alive.current)
              setSyncError(
                error instanceof Error
                  ? error.message
                  : "Could not save appearance.",
              );
          } finally {
            pending.current--;
            if (alive.current && pending.current === 0)
              setSyncStatus(
                failed.current
                  ? "Not synced"
                  : "Saved to your account · available in all apps",
              );
          }
        });
    },
    [api, apply],
  );

  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    const refresh = async () => {
      if (pending.current || failed.current || document.hidden) return;
      const started = revision.current;
      try {
        const response = await api.get(PATH, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok)
          throw new Error(
            "Could not load account appearance. Retry when connected.",
          );
        const data = (await response.json()) as {
          preferences: CompanionAppearance;
        };
        if (!data.preferences)
          throw new Error("Could not load account appearance.");
        if (!controller.signal.aborted && started === revision.current) {
          apply(readCompanionAppearance(data.preferences));
          setSyncStatus("Saved to your account · available in all apps");
          setSyncError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSyncStatus("Not synced · using cached appearance");
          setSyncError(
            error instanceof Error
              ? error.message
              : "Could not sync appearance.",
          );
        }
      }
    };
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = setInterval(onFocus, 30000);
    return () => {
      alive.current = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [api, apply]);

  const update = useCallback(
    (patch: Partial<CompanionPreferences>) => {
      onChange?.(patch);
      apply(mergeCompanionAppearance(current.current, patch));
      save(patch);
    },
    [onChange, apply, save],
  );
  const setAppCharacter = useCallback(
    (target: CompanionApp, characterId: string | null) => {
      const patch = {
        apps: { [target]: characterId ? { characterId } : null },
      };
      apply(mergeCompanionAppearance(current.current, patch));
      save(patch);
    },
    [apply, save],
  );

  return {
    preferences: {
      ...appearance,
      characterId: appearance.apps[app]?.characterId ?? appearance.characterId,
    },
    update,
    app,
    sharedCharacterId: appearance.characterId,
    appCharacters: appearance.apps,
    setAppCharacter,
    syncStatus,
    syncError,
    retrySync: () => {
      if (failed.current) save(failed.current);
      else window.dispatchEvent(new Event("focus"));
    },
  };
}
