import { sortedSuiteAiEvents, type SuiteAiJob } from "./suite-ai-job";

export type CompanionActivity = {
  actionId: string;
  label: string;
  busy: boolean;
};
export type CompanionPreferences = {
  enabled: boolean;
  characterId: string;
  themeId: string;
  motion: boolean;
};
export const DEFAULT_COMPANION: CompanionPreferences = {
  enabled: true,
  characterId: "dot",
  themeId: "auto",
  motion: true,
};

export const COMPANION_APPS = [
  "turtletime",
  "tides",
  "shellstack",
  "kraken",
  "shelly",
] as const;
export type CompanionApp = (typeof COMPANION_APPS)[number];
export type CompanionAppearance = CompanionPreferences & {
  apps: Partial<Record<CompanionApp, { characterId: string }>>;
};
export type CompanionAppearancePatch = Partial<CompanionPreferences> & {
  apps?: Partial<Record<CompanionApp, { characterId: string } | null>>;
};

export function readCompanionAppearance(value: unknown): CompanionAppearance {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const apps: CompanionAppearance["apps"] = {};
  for (const app of COMPANION_APPS) {
    const profile = (data.apps as CompanionAppearance["apps"] | undefined)?.[
      app
    ];
    if (
      profile &&
      typeof profile.characterId === "string" &&
      /^[a-z][a-z-]{0,40}$/.test(profile.characterId)
    )
      apps[app] = { characterId: profile.characterId };
  }
  return { ...readCompanionPreferences(JSON.stringify(data)), apps };
}

export function mergeCompanionAppearance(
  current: CompanionAppearance,
  patch: CompanionAppearancePatch,
): CompanionAppearance {
  const apps = { ...current.apps };
  for (const app of COMPANION_APPS) {
    if (patch.apps?.[app] === null) delete apps[app];
    else if (patch.apps?.[app]) apps[app] = patch.apps[app]!;
  }
  return readCompanionAppearance({ ...current, ...patch, apps });
}

export function readCompanionPreferences(
  value: string | null,
): CompanionPreferences {
  try {
    const p: unknown = JSON.parse(value || "null");
    if (!p || typeof p !== "object") return DEFAULT_COMPANION;
    const v = p as Record<string, unknown>;
    return {
      enabled: typeof v.enabled === "boolean" ? v.enabled : true,
      characterId:
        typeof v.characterId === "string" &&
        /^[a-z][a-z-]{0,40}$/.test(v.characterId)
          ? v.characterId
          : DEFAULT_COMPANION.characterId,
      themeId:
        typeof v.themeId === "string" &&
        /^[a-z][a-z0-9-]{0,60}$/.test(v.themeId)
          ? v.themeId
          : DEFAULT_COMPANION.themeId,
      motion: typeof v.motion === "boolean" ? v.motion : true,
    };
  } catch {
    return DEFAULT_COMPANION;
  }
}

const TOOL_ACTIONS: Record<string, string> = {
  search_docs: "searching",
  search_tasks: "searching",
  search_sources: "searching",
  search_source_data: "searching",
  web_search: "searching",
  read_doc: "reading",
  read_linked_document: "reading",
  get_card: "reading",
  get_task: "reading",
  get_project: "reading",
  list_projects: "reading",
  list_time_entries: "reading",
  load_skill: "reading",
  remember: "remembering",
  memory_search: "remembering",
  propose_task_update: "reviewing",
  post_comment: "writing",
};

const SUMMARY_ACTIONS: Array<[RegExp, string]> = [
  [/consolidat|synthesi|summar/i, "summarising"],
  [/search|looking for|gather|finding/i, "searching"],
  [/read|scrap|fetch|document|context/i, "reading"],
  [/writ|draft|reply|answer|finalis/i, "writing"],
  [/plan|understand|breaking|step/i, "planning"],
  [/remember|memory/i, "remembering"],
  [/review|rank|check|verify|validate/i, "reviewing"],
];

function actionForEvent(
  event: { event_type: string; summary: string; payload: Record<string, unknown> },
): string {
  const tool =
    typeof event.payload?.tool === "string" ? event.payload.tool : "";
  if (event.event_type === "tool" && tool && TOOL_ACTIONS[tool])
    return TOOL_ACTIONS[tool];
  const summary = event.summary || "";
  for (const [pattern, action] of SUMMARY_ACTIONS)
    if (pattern.test(summary)) return action;
  return event.event_type === "tool" ? "tool-running" : "thinking";
}

/** Structured lifecycle only: never infer execution from prose or a proposed write. */
export function companionActivity(
  jobs: SuiteAiJob[],
  actions: Array<{ status: string }> = [],
): CompanionActivity {
  const active = jobs.find(
    (j) => j.status === "pending" || j.status === "running",
  );
  if (active) {
    if (active.status === "pending")
      return { actionId: "queuing", label: "Request queued", busy: true };
    const event = sortedSuiteAiEvents(active.events ?? []).at(-1);
    if (event)
      return {
        actionId: actionForEvent(event),
        label: event.summary || "Preparing a reply",
        busy: true,
      };
    return {
      actionId: "thinking",
      label: "Preparing a reply",
      busy: true,
    };
  }
  if (actions.some((a) => a.status === "proposed"))
    return {
      actionId: "awaiting-approval",
      label: "Review the proposed changes",
      busy: false,
    };
  const latest = jobs[0],
    event = latest
      ? sortedSuiteAiEvents(latest.events ?? []).at(-1)
      : undefined;
  if (latest?.status === "cancelled" || event?.event_type === "cancelled")
    return { actionId: "cancelled", label: "Request stopped", busy: false };
  if (latest?.status === "failed")
    return { actionId: "error", label: "Request needs attention", busy: false };
  return { actionId: "idle", label: "Ready when you are", busy: false };
}
