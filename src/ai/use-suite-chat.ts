import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { companionActivity, type CompanionActivity } from "./companion";
import { activeSuiteAiJobs, type SuiteAiJob } from "./suite-ai-job";

type ChatMessage = { actions?: Array<{ status: string }> };
type ChatData<M> = { messages: M[]; configured: boolean; jobs?: SuiteAiJob[] };
type ChatApi = {
  get(path: string, init?: RequestInit): Promise<Response>;
  post(path: string, body: unknown, init?: RequestInit): Promise<Response>;
  delete(path: string, init?: RequestInit): Promise<Response>;
};

async function checked(response: Response): Promise<Response> {
  if (response.ok) return response;
  let message = `Request failed (${response.status})`;
  try {
    const data = (await response.json()) as { error?: string; detail?: string };
    message = data.error || data.detail || message;
  } catch {
    /* retain status if the server did not return JSON */
  }
  throw new Error(message);
}

/** Mount once per authenticated account/scope. Hosts retain JWTs and workspace/org headers. */
export function useSuiteChat<M extends ChatMessage>({
  api,
  app,
  path,
  open,
  onActivity,
  onEvent,
}: {
  api: ChatApi;
  app: string;
  path: string;
  open?: boolean;
  onActivity(activity: CompanionActivity): void;
  onEvent?(event: string, properties: Record<string, unknown>): void;
}) {
  const context = useRef({ path, onEvent });
  context.current = { path, onEvent };
  const controller = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const activeIds = useRef<string[]>([]);
  const [jobs, setJobs] = useState<SuiteAiJob[]>([]);
  const [chatRevision, setChatRevision] = useState(0);
  const isWaitingForReply = activeSuiteAiJobs(jobs).length > 0;

  useLayoutEffect(() => {
    const current = new AbortController();
    controller.current = current;
    onActivity({ actionId: "idle", label: "Ready when you are", busy: false });
    return () => {
      current.abort();
      if (controller.current === current) controller.current = null;
    };
  }, [onActivity]);

  const signalFor = useCallback((signal?: AbortSignal) => {
    const scope = controller.current?.signal;
    if (!scope || scope.aborted)
      throw new DOMException("Chat scope ended", "AbortError");
    return signal ? AbortSignal.any([scope, signal]) : scope;
  }, []);
  const apply = useCallback(
    (data: { jobs?: SuiteAiJob[]; messages?: M[] }) => {
      if (!controller.current || controller.current.signal.aborted) return;
      const hadActiveWork = activeIds.current.length > 0;
      const next = data.jobs ?? [];
      activeIds.current = activeSuiteAiJobs(next).map((job) => job.id);
      setJobs(next);
      onActivity(
        companionActivity(
          next,
          data.messages?.flatMap((message) => message.actions ?? []) ?? [],
        ),
      );
      if (hadActiveWork && !activeIds.current.length)
        setChatRevision((value) => value + 1);
    },
    [onActivity],
  );

  const fetchChat = useCallback(async () => {
    const version = ++sequence.current,
      signal = signalFor();
    const response = await checked(await api.get("/api/ai/chat", { signal }));
    const data = (await response.json()) as ChatData<M>;
    signal.throwIfAborted();
    if (version === sequence.current) apply(data);
    return data;
  }, [api, apply, signalFor]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        await fetchChat();
      } catch {
        if (!cancelled)
          onActivity({
            actionId: "error",
            label: "Connection lost — activity status unknown",
            busy: false,
          });
      }
      if (cancelled || (!open && !activeIds.current.length)) return;
      timer = setTimeout(
        tick,
        document.hidden ? 10000 : activeIds.current.length ? 1500 : 6000,
      );
    };
    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchChat, open, isWaitingForReply, onActivity]);

  const submit = useCallback(
    async ({
      prompt,
      index,
      signal,
    }: {
      prompt: string;
      index?: number;
      signal?: AbortSignal;
    }) => {
      const requestSignal = signalFor(signal);
      const response = await checked(
        await api.post(
          "/api/ai/chat",
          {
            prompt,
            ...(index === undefined ? {} : { edit_index: index }),
            page_context: { app, path: context.current.path || "/" },
          },
          { signal: requestSignal },
        ),
      );
      const result = (await response.json()) as {
        messages: M[];
        job: SuiteAiJob;
        jobs?: SuiteAiJob[];
      };
      requestSignal.throwIfAborted();
      sequence.current++;
      apply({ jobs: result.jobs ?? [result.job], messages: result.messages });
      context.current.onEvent?.("AI Message Sent", {
        prompt_length: prompt.length,
        page_path: context.current.path,
        is_edit: index !== undefined,
        is_preset: false,
        has_attachment: false,
      });
      return { messages: result.messages, reply: "Queued" };
    },
    [api, app, apply, signalFor],
  );
  const sendMessage = useCallback(
    (input: { prompt: string; signal?: AbortSignal }) => submit(input),
    [submit],
  );
  const editMessage = useCallback(
    (input: { index: number; prompt: string; signal?: AbortSignal }) =>
      submit(input),
    [submit],
  );

  const clearChat = useCallback(async () => {
    const signal = signalFor();
    await checked(await api.delete("/api/ai/chat", { signal }));
    signal.throwIfAborted();
    sequence.current++;
    apply({ messages: [] });
    setChatRevision((value) => value + 1);
  }, [api, apply, signalFor]);
  const cancelMessage = useCallback(async () => {
    const signal = signalFor();
    const response = await checked(
      await api.post("/api/ai/chat/cancel", {}, { signal }),
    );
    const data = (await response.json()) as { messages?: M[] };
    signal.throwIfAborted();
    sequence.current++;
    activeIds.current = [];
    setJobs([]);
    onActivity({
      actionId: "cancelled",
      label: "Request stopped",
      busy: false,
    });
    return data;
  }, [api, onActivity, signalFor]);
  const resolveAction = useCallback(
    async (
      id: string,
      decision: "confirm" | "cancel",
      edits?: Record<string, unknown>,
    ) => {
      const signal = signalFor();
      const response = await checked(
        await api.post(
          "/api/ai/chat/actions",
          { id, decision, edits },
          { signal },
        ),
      );
      const result = (await response.json()) as { messages: M[] };
      signal.throwIfAborted();
      sequence.current++;
      apply({ ...result, jobs });
      setChatRevision((value) => value + 1);
      return result;
    },
    [api, apply, jobs, signalFor],
  );
  return {
    fetchChat,
    sendMessage,
    editMessage,
    clearChat,
    cancelMessage,
    resolveAction,
    isWaitingForReply,
    chatRevision,
  };
}
