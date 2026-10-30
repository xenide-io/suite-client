import { afterEach, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { useSuiteChat } from "./use-suite-chat";

type Message = {
  role: string;
  content: string;
  actions?: Array<{ status: string }>;
};
const idle = { messages: [], configured: true, jobs: [] };
const running = {
  id: "job",
  status: "running",
  events: [
    {
      sequence: 1,
      event_type: "tool",
      payload: { tool: "search_docs" },
      summary: "Searching",
      created_at: "",
    },
  ],
};
const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("keeps active work polling while closed, then stops without remounting the controller", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  const api = {
    get: vi.fn().mockImplementation(async () => json(idle)),
    post: vi
      .fn()
      .mockImplementation(async () =>
        json({ messages: [{ role: "user", content: "yow" }], job: running }),
      ),
    delete: vi.fn(),
  };
  const onActivity = vi.fn();
  let chat!: ReturnType<typeof useSuiteChat<Message>>;
  function Harness() {
    chat = useSuiteChat<Message>({
      api,
      app: "tides",
      path: "/dashboard",
      open: false,
      onActivity,
    });
    return null;
  }
  const root = createRoot(document.createElement("div"));
  try {
    await act(async () => root.render(createElement(Harness)));
    api.get.mockImplementation(async () => json({ ...idle, jobs: [running] }));
    await act(async () => {
      await chat.sendMessage({ prompt: "yow" });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(chat.isWaitingForReply).toBe(true);
    expect(onActivity).toHaveBeenLastCalledWith({
      actionId: "searching",
      label: "Searching",
      busy: true,
    });
    expect(api.post.mock.calls[0][1]).toMatchObject({
      page_context: { app: "tides", path: "/dashboard" },
    });
    api.get.mockImplementation(async () =>
      json({ ...idle, jobs: [{ ...running, status: "completed" }] }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(chat.isWaitingForReply).toBe(false);
    expect(chat.chatRevision).toBe(1);
    const reads = api.get.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(api.get).toHaveBeenCalledTimes(reads);
  } finally {
    await act(async () => root.unmount());
  }
});

it("aborts every in-flight request and refuses late results after a scope unmount", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let release!: (value: Response) => void;
  const api = {
    get: vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    ),
    post: vi.fn(),
    delete: vi.fn(),
  };
  const onActivity = vi.fn();
  let chat!: ReturnType<typeof useSuiteChat<Message>>;
  function Harness() {
    chat = useSuiteChat<Message>({
      api,
      app: "shellstack",
      path: "/settings",
      onActivity,
    });
    return null;
  }
  const root = createRoot(document.createElement("div"));
  await act(async () => root.render(createElement(Harness)));
  const signal = api.get.mock.calls[0][1].signal as AbortSignal;
  const late = chat.fetchChat();
  await act(async () => root.unmount());
  expect(signal.aborted).toBe(true);
  onActivity.mockClear();
  release(json({ ...idle, jobs: [running] }));
  await expect(late).rejects.toMatchObject({ name: "AbortError" });
  expect(onActivity).not.toHaveBeenCalled();
});
