import { describe, expect, it } from "vitest";
import {
  companionActivity,
  DEFAULT_COMPANION,
  readCompanionPreferences,
  readCompanionAppearance,
  mergeCompanionAppearance,
} from "./companion";
import type { SuiteAiJob, SuiteAiJobEvent } from "./suite-ai-job";

const event = (
  type: SuiteAiJobEvent["event_type"],
  tool = "",
  sequence = 1,
): SuiteAiJobEvent => ({
  sequence,
  event_type: type,
  payload: { tool },
  summary: "Reported stage",
  created_at: "",
});
const job = (
  status: SuiteAiJob["status"],
  events: SuiteAiJobEvent[] = [],
): SuiteAiJob => ({ id: "job", status, events });
describe("companion lifecycle", () => {
  it("defaults to Dot, follows the app theme, and merges app assignments without losing siblings", () => {
    expect(DEFAULT_COMPANION.characterId).toBe("dot");
    expect(DEFAULT_COMPANION.themeId).toBe("auto");
    const a = mergeCompanionAppearance(readCompanionAppearance(null), {
      apps: { tides: { characterId: "pip" } },
    });
    const b = mergeCompanionAppearance(a, {
      themeId: "github-light",
      apps: { kraken: { characterId: "rune" } },
    });
    expect(b.apps).toEqual({
      tides: { characterId: "pip" },
      kraken: { characterId: "rune" },
    });
    expect(mergeCompanionAppearance(b, { apps: { tides: null } }).apps).toEqual(
      { kraken: { characterId: "rune" } },
    );
  });
  it("uses structured starts, not wording, and settles after a tool result", () => {
    expect(companionActivity([job("pending")]).actionId).toBe("queuing");
    expect(
      companionActivity([job("running", [event("tool", "search_docs")])])
        .actionId,
    ).toBe("searching");
    expect(
      companionActivity([
        job("running", [
          event("progress", "search_docs", 2),
          event("tool", "search_docs", 1),
        ]),
      ]).actionId,
    ).toBe("thinking");
    expect(
      companionActivity([job("running", [event("tool", "propose_delete")])])
        .actionId,
    ).toBe("tool-running");
  });
  it("names real progress stages instead of leaving every step as thinking", () => {
    const stage = (summary: string): SuiteAiJobEvent => ({
      sequence: 1,
      event_type: "progress",
      payload: {},
      summary,
      created_at: "",
    });
    expect(
      companionActivity([
        job("running", [stage("Understanding your request")]),
      ]).actionId,
    ).toBe("planning");
    expect(
      companionActivity([
        job("running", [stage("Consolidating the sources")]),
      ]).actionId,
    ).toBe("summarising");
    expect(
      companionActivity([job("running", [stage("Finalising the reply")])])
        .actionId,
    ).toBe("writing");
  });
  it("keeps approvals and acknowledges both cancellation contracts", () => {
    expect(
      companionActivity([job("completed")], [{ status: "proposed" }]).actionId,
    ).toBe("awaiting-approval");
    expect(companionActivity([job("cancelled")]).actionId).toBe("cancelled");
    expect(
      companionActivity([job("failed", [event("cancelled")])]).actionId,
    ).toBe("cancelled");
    expect(companionActivity([job("failed")]).actionId).toBe("error");
    expect(companionActivity([]).actionId).toBe("idle");
  });
  it("rejects broken or executable preferences and keeps safe defaults", () => {
    for (const value of [
      null,
      "bad json",
      "[]",
      '{"characterId":"../evil","themeId":"<script>","motion":"false"}',
    ]) {
      expect(readCompanionPreferences(value)).toEqual(DEFAULT_COMPANION);
    }
    expect(
      readCompanionPreferences(
        '{"enabled":false,"characterId":"pip","themeId":"rose-pine-dawn","motion":false}',
      ),
    ).toEqual({
      enabled: false,
      characterId: "pip",
      themeId: "rose-pine-dawn",
      motion: false,
    });
  });
});
