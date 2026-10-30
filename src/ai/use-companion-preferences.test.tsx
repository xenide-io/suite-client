import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useCompanionPreferences } from "./use-companion-preferences";
import {
  mergeCompanionAppearance,
  readCompanionAppearance,
  type CompanionAppearancePatch,
} from "./companion";

let container: HTMLDivElement, root: ReturnType<typeof createRoot>;
let value: ReturnType<typeof useCompanionPreferences>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
const response = (preferences: unknown) =>
  new Response(JSON.stringify({ preferences }));
function Harness(props: Parameters<typeof useCompanionPreferences>[0]) {
  value = useCompanionPreferences(props);
  return <span>{value.preferences.characterId}</span>;
}

it("retries a failed queued patch with the next edit without losing fields or retaining a stale error", async () => {
  const api = {
    get: vi.fn(async () => response(readCompanionAppearance(null))),
    patch: vi
      .fn()
      .mockResolvedValueOnce(new Response("offline", { status: 503 }))
      .mockResolvedValueOnce(
        response({ characterId: "pip", themeId: "github-light" }),
      ),
  };
  await act(async () =>
    root.render(<Harness accountId="person" app="tides" api={api} />),
  );
  await act(async () => {
    value.update({ characterId: "pip" });
    value.update({ themeId: "github-light" });
  });
  expect(api.patch.mock.calls[1][1]).toMatchObject({
    characterId: "pip",
    themeId: "github-light",
  });
  expect(value.preferences.characterId).toBe("pip");
  expect(value.syncError).toBe("");
});

it("saves shared appearance and per-app assignments, then restores from the account in another app", async () => {
  let saved = readCompanionAppearance(null);
  const api = {
    get: vi.fn(async () => response(saved)),
    patch: vi.fn(async (_path: string, patch: unknown) => {
      saved = mergeCompanionAppearance(
        saved,
        patch as CompanionAppearancePatch,
      );
      return response(saved);
    }),
  };
  await act(async () =>
    root.render(<Harness accountId="person" app="tides" api={api} />),
  );
  await act(async () => {
    value.update({ characterId: "pip", themeId: "github-light" });
    value.setAppCharacter("tides", "rune");
  });
  await vi.waitFor(() =>
    expect(value.syncStatus).toContain("Saved to your account"),
  );
  expect(value.preferences.characterId).toBe("rune");
  await act(async () =>
    root.render(
      <Harness key="kraken" accountId="person" app="kraken" api={api} />,
    ),
  );
  expect(value.preferences.characterId).toBe("pip");
  expect(value.preferences.themeId).toBe("github-light");
  expect(value.appCharacters.tides?.characterId).toBe("rune");
});

it("does not replace a new edit with a late initial load, and reports/retries failed saves", async () => {
  let resolve!: (response: Response) => void;
  const get = new Promise<Response>((done) => {
    resolve = done;
  });
  const api = {
    get: vi.fn(() => get),
    patch: vi
      .fn()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(response({ characterId: "pip", themeId: "auto" })),
  };
  await act(async () =>
    root.render(<Harness accountId="person" app="tides" api={api} />),
  );
  await act(async () => value.update({ characterId: "pip" }));
  await act(async () => resolve(response(readCompanionAppearance(null))));
  expect(value.preferences.characterId).toBe("pip");
  expect(value.syncError).toContain("could not be saved");
  await act(async () => value.retrySync());
  expect(value.syncError).toBe("");
  expect(value.syncStatus).toContain("Saved to your account");
});
