import type { AuthoringEvalReport } from "@dojofoo/authoring/server";
import type { AuthoringWorkspace } from "@dojofoo/authoring/service";
import { RichTextKit, TypistEditor, type UpdateProps } from "@doist/typist";
import { authoringMessageText, isAuthoringBootstrapMessage } from "@dojofoo/authoring/types";
import { createFileRoute } from "@tanstack/react-router";
import { fetchServerSentEvents, useChat, type UIMessage } from "@tanstack/ai-react";
import { ArrowRight, Check, Circle, CircleDot, ExternalLink, Play, RefreshCw, Save, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CourseContent } from "@/components/course-content";
import { Button } from "@dojofoo/ui/button";
import { ChatContainer, ChatContainerContent, ChatContainerFooter } from "@dojofoo/ui/chat-container";
import { CourseLessonLayout, CourseLessonNavigation } from "@dojofoo/ui/course-lesson-layout";
import { InputMessage } from "@dojofoo/ui/input-message";
import { ScrollArea } from "@dojofoo/ui/scroll-area";
import { ThinkingIndicator } from "@dojofoo/ui/thinking-indicator";
import type { AskUserAnswer } from "@dojofoo/ui/ask-user-questions";
import { StreamedChatMessage } from "./index";

type ReportResponse = { report: AuthoringEvalReport | null; root: string };
type AuthoringFile = { content: string; label: string; path: string };

export const Route = createFileRoute("/authoring")({ component: AuthoringPage });

function AuthoringPage() {
  const [workspace, setWorkspace] = useState<AuthoringWorkspace | null>(null);
  const [report, setReport] = useState<AuthoringEvalReport | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeFilePath, setActiveFilePath] = useState("dojo.yaml");
  const [draft, setDraft] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("Loading your dojo…");
  const [error, setError] = useState<string | null>(null);
  const outgoing = useRef<Record<string, unknown>>({});
  const chatConnection = useMemo(() => fetchServerSentEvents(
    authoringApi("/api/authoring/messages"),
    () => ({ body: outgoing.current })
  ), []);
  const {
    messages: chatMessages,
    sendMessage: sendChatMessage,
    setMessages: setChatMessages,
    status: chatStatus,
  } = useChat({ connection: chatConnection, persistence: false, threadId: "kyoshi" });

  useEffect(() => { void bootstrap(); }, []);

  const selectedLesson = workspace?.lessons.find(({ id }) => id === selectedLessonId) ?? null;
  const files = workspace ? authoringFiles(workspace, selectedLesson) : [];
  const activeFile = files.find(({ path }) => path === activeFilePath) ?? files[0] ?? null;
  const dirty = Boolean(activeFile) && draft !== activeFile.content;
  const evalReady = workspace
    ? [...workspace.courseChecks, ...workspace.lessons.flatMap(({ checks }) => checks)].every(({ ready }) => ready)
    : false;

  useEffect(() => {
    if (!activeFile) return;
    setActiveFilePath(activeFile.path);
    setDraft(activeFile.content);
  }, [activeFile?.content, activeFile?.path]);

  function selectWorkspace(next: AuthoringWorkspace) {
    setWorkspace(next);
    setSelectedLessonId((current) => next.lessons.some(({ id }) => id === current)
      ? current
      : next.lessons[0]?.id ?? null);
  }

  function hydrateChat(next: AuthoringWorkspace) {
    setChatMessages(next.messages
      .filter((entry) => (entry.kind === undefined || entry.kind === "message") && !isAuthoringBootstrapMessage(entry))
      .map((entry, index): UIMessage => ({
        id: `${entry.startedAt ?? 0}:${index}`,
        role: entry.role,
        parts: [{ type: "text", content: authoringMessageText(entry) }],
      })));
  }

  async function bootstrap() {
    try {
      const initial = await request<AuthoringWorkspace>("/api/authoring/workspace");
      selectWorkspace(initial);
      hydrateChat(initial);
      setReport((await request<ReportResponse>("/api/authoring/report")).report);
      setBusy("Kyoshi is preparing the course…");
      await request<AuthoringWorkspace>("/api/authoring/session", { method: "POST" });
      await drainStream("/api/authoring/introduction", { method: "POST" });
      const ready = await request<AuthoringWorkspace>("/api/authoring/workspace");
      selectWorkspace(ready);
      hydrateChat(ready);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  async function perform(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try { await action(); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(""); }
  }

  async function refreshWorkspace() {
    await perform("Refreshing course files…", async () => {
      selectWorkspace(await request<AuthoringWorkspace>("/api/authoring/workspace"));
      setReport((await request<ReportResponse>("/api/authoring/report")).report);
    });
  }

  async function sendMessage(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessage("");
    outgoing.current = { message: trimmed };
    setBusy("Kyoshi is responding…");
    setSavedNotice(false);
    try { await sendChatMessage(trimmed); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(""); }
  }

  async function answerTool(answers: Record<string, AskUserAnswer>) {
    await perform("Continuing authoring…", async () => {
      await request("/api/authoring/answers", {
        body: JSON.stringify({ answers: Object.fromEntries(Object.values(answers).map((answer) => [
          answer.questionId,
          answer.otherText ? [...answer.selectedIds, answer.otherText] : answer.selectedIds,
        ])) }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
    });
  }

  async function saveFile() {
    if (!activeFile || !dirty) return;
    await perform(`Saving ${activeFile.label}…`, async () => {
      const next = await request<AuthoringWorkspace>(authoringFileUrl(activeFile.path), {
        body: JSON.stringify({ content: draft }),
        headers: { "content-type": "application/json" },
        method: "PUT",
      });
      selectWorkspace(next);
      setSavedNotice(true);
    });
  }

  async function trialLesson(lessonId: string) {
    await perform("Preparing a learner trial…", async () => {
      const trial = await request<{ courseId: string; lessonId: string; workspaceId: string }>(
        `/api/authoring/lessons/${encodeURIComponent(lessonId)}/trials`,
        { method: "POST" }
      );
      window.open(`/course/${trial.workspaceId}/${trial.courseId}/lesson/${trial.lessonId}`, "_blank", "noopener");
    });
  }

  async function runEvals(harness: "cassette" | "opencode") {
    await perform(`Running ${harness} evaluations…`, async () => {
      const response = await request<ReportResponse>("/api/authoring/evals", {
        body: JSON.stringify({ harness }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      setReport(response.report);
      setShowResults(true);
    });
  }

  if (!workspace) return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Kyoshi</h1>
      <p className="mt-4 font-prose text-muted-foreground">{error ?? busy}</p>
    </main>
  );

  return (
    <CourseLessonLayout
      navigation={(
        <CourseLessonNavigation courseTitle={workspace.name || "Untitled dojo"}>
          <button
            className={`flex w-full items-center gap-2.5 border-b border-dashed px-4 py-4 text-left text-[14px] font-medium outline-none transition-colors hover:bg-hover hover:text-foreground ${selectedLessonId === null ? "bg-hover text-foreground" : "text-muted-foreground"}`}
            onClick={() => {
              setSelectedLessonId(null);
              setActiveFilePath("dojo.yaml");
              setShowResults(false);
            }}
            type="button"
          >
            <span className="min-w-0 flex-1 truncate">Course</span>
            <ArrowRight className={selectedLessonId === null ? "size-4" : "size-4 opacity-0"} strokeWidth={1.75} />
          </button>
          {workspace.lessons.map((lesson) => (
            <button
              className={`flex w-full items-center gap-2.5 border-b border-dashed px-4 py-4 text-left text-[14px] font-medium outline-none transition-colors hover:bg-hover hover:text-foreground ${selectedLessonId === lesson.id ? "bg-hover text-foreground" : "text-muted-foreground"}`}
              key={lesson.id}
              onClick={() => {
                setSelectedLessonId(lesson.id);
                setActiveFilePath(lesson.briefingPath);
                setShowResults(false);
              }}
              type="button"
            >
              <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
              <ArrowRight className={selectedLessonId === lesson.id ? "size-4" : "size-4 opacity-0"} strokeWidth={1.75} />
            </button>
          ))}
          {workspace.lessons.length === 0 ? (
            <div className="border-b border-dashed p-4 font-prose text-[13px] leading-5 text-muted-foreground">
              Shape the course with Kyoshi. Lessons will appear here as they are authored.
            </div>
          ) : null}
        </CourseLessonNavigation>
      )}
      lesson={(
        <ScrollArea className="min-h-0 bg-surface-1" data-testid="authoring-lesson-pane">
          <div className="flex flex-col pb-12">
            <div className="order-2 px-8 pt-8">
              <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {selectedLesson ? "Lesson draft" : "Course draft"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{selectedLesson?.title ?? workspace.name}</h2>
              <CourseContent basePath={null} workspaceId="">
                {selectedLesson?.description || workspace.description
                  || "Describe the observable learner outcome here. The authored material stays in the editor above."}
              </CourseContent>
              <ReadinessPanel lesson={selectedLesson} workspace={workspace} />
              {workspace.issues.length > 0 ? (
                <div className="mt-7 border border-amber-500/35 bg-amber-500/5 p-4">
                  <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-amber-300">Draft issues</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 font-prose text-sm text-muted-foreground">
                    {workspace.issues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
            <section className="order-1 w-full border-b border-[#242424] bg-[#0a0a0a] text-[#ededed] shadow-surface-3" data-testid="authoring-workspace">
              <div className="flex h-10 items-stretch border-b border-[#242424] bg-black">
                <div className="flex items-stretch" role="tablist" aria-label="Authoring workspace">
                  {files.map((file) => (
                    <WorkspaceTabButton
                      active={!showResults && activeFile?.path === file.path}
                      key={file.path}
                      onClick={() => {
                        setActiveFilePath(file.path);
                        setDraft(file.content);
                        setShowResults(false);
                      }}
                    >
                      {file.label}
                      {activeFile?.path === file.path && dirty ? <Circle className="size-2 fill-[#14cbb7] text-[#14cbb7]" /> : null}
                    </WorkspaceTabButton>
                  ))}
                  <WorkspaceTabButton active={showResults} onClick={() => setShowResults(true)}>
                    <CircleDot className="size-3.5" /> Results
                    <span className="text-[10px] text-[#878787]">{report ? `${Math.round(report.score * 100)}%` : "—"}</span>
                  </WorkspaceTabButton>
                </div>
                {busy ? <span className="ml-auto self-center px-3 text-xs text-[#878787]">{busy}</span> : null}
                <div className={`${busy ? "" : "ml-auto"} flex items-stretch border-l border-[#242424]`}>
                  <WorkspaceAction disabled={Boolean(busy)} onClick={() => void refreshWorkspace()}><RefreshCw className="size-3.5" /> Refresh</WorkspaceAction>
                  {!showResults ? <WorkspaceAction disabled={!dirty || Boolean(busy)} onClick={() => setDraft(activeFile?.content ?? "")}><Undo2 className="size-3.5" /> Undo</WorkspaceAction> : null}
                  {!showResults ? <WorkspaceAction disabled={!dirty || Boolean(busy)} onClick={() => void saveFile()}><Save className="size-3.5" /> Save</WorkspaceAction> : null}
                  {selectedLesson ? <WorkspaceAction disabled={Boolean(busy)} onClick={() => void trialLesson(selectedLesson.id)}><ExternalLink className="size-3.5" /> Trial</WorkspaceAction> : null}
                  <button className="bg-[#0070f3] px-4 text-xs text-white hover:bg-[#0761d1] disabled:bg-[#242424] disabled:text-[#878787]" disabled={Boolean(busy) || !evalReady} onClick={() => void runEvals("cassette")} title={evalReady ? "Run learner-persona evaluations" : "Complete the authoring checklist first"} type="button">Run evals</button>
                </div>
              </div>
              <div className="aspect-video min-h-0 overflow-auto">
                {showResults
                  ? <div className="h-full p-6 font-mono text-xs leading-6"><EvaluationReport onRun={runEvals} report={report} running={Boolean(busy)} /></div>
                  : activeFile && /\.mdx?$/u.test(activeFile.path)
                  ? <MarkdownEditor key={activeFile.path} content={draft} onChange={setDraft} />
                  : <textarea
                      aria-label={`Edit ${activeFile?.label ?? "authoring file"}`}
                      className="h-full w-full resize-none bg-transparent p-6 font-mono text-[13px] leading-6 text-[#ededed] outline-none placeholder:text-[#878787]"
                      onChange={(event) => setDraft(event.target.value)}
                      spellCheck={false}
                      value={draft}
                    />}
              </div>
            </section>
            {savedNotice ? <p className="order-3 mx-8 mt-3 text-xs text-muted-foreground">Kyoshi will read the saved files with your next message.</p> : null}
            {error ? <p className="order-3 mx-8 mt-4 border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</p> : null}
          </div>
        </ScrollArea>
      )}
      chat={(
        <ChatContainer data-testid="authoring-chat-pane">
          <ChatContainerContent>
            {chatMessages.map((entry) => (
              <StreamedChatMessage fragments={{}} key={entry.id} message={entry} onToolAnswer={answerTool} streaming={chatStatus === "streaming" && entry.id === chatMessages.at(-1)?.id} workspaceId="" />
            ))}
            {(busy || chatStatus === "submitted") && chatStatus !== "streaming" ? <ThinkingIndicator className="px-0" /> : null}
          </ChatContainerContent>
          <ChatContainerFooter data-testid="authoring-chat-composer">
            <InputMessage
              disabled={Boolean(busy)}
              history={chatMessages.filter(({ role }) => role === "user").map((entry) => entry.parts.flatMap((part) => part.type === "text" ? [part.content] : []).join(""))}
              onSend={(value) => void sendMessage(value)}
              onValueChange={setMessage}
              placeholder="Shape the course with Kyoshi…"
              sendLabel="Send"
              status={busy || chatStatus === "streaming" || chatStatus === "submitted" ? "streaming" : "idle"}
              value={message}
            />
          </ChatContainerFooter>
        </ChatContainer>
      )}
    />
  );
}

function MarkdownEditor({ content, onChange }: { content: string; onChange: (value: string) => void }) {
  return (
    <TypistEditor
      className="authoring-markdown h-full min-h-full p-6 font-prose text-[15px] leading-7 text-[#ededed] outline-none"
      content={content}
      extensions={[RichTextKit]}
      onUpdate={({ getMarkdown }: UpdateProps) => onChange(getMarkdown())}
      placeholder="Write the course draft…"
    />
  );
}

function ReadinessPanel({ lesson, workspace }: {
  lesson: AuthoringWorkspace["lessons"][number] | null;
  workspace: AuthoringWorkspace;
}) {
  const [scope, setScope] = useState<"course" | "lesson">(lesson ? "lesson" : "course");
  useEffect(() => setScope(lesson ? "lesson" : "course"), [lesson?.id]);
  const checks = scope === "course" ? workspace.courseChecks : lesson?.checks ?? [];
  return (
    <section className="mt-7 border border-dashed">
      <div className="flex border-b border-dashed" role="tablist" aria-label="Draft readiness">
        {(["course", "lesson"] as const).map((item) => (
          <button
            aria-selected={scope === item}
            className={`px-4 py-2 font-display text-xs font-medium uppercase tracking-[0.14em] ${scope === item ? "bg-hover text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            disabled={item === "lesson" && !lesson}
            key={item}
            onClick={() => setScope(item)}
            role="tab"
            type="button"
          >{item}</button>
        ))}
      </div>
      <div className="grid gap-px bg-border/50 sm:grid-cols-2">
        {checks.map((check) => (
          <div className="flex items-center gap-2 bg-background px-4 py-3 font-prose text-sm" key={check.id}>
            {check.ready ? <Check className="size-4 text-emerald-400" /> : <Circle className="size-4 text-muted-foreground" />}
            <span className={check.ready ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkspaceTabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button aria-selected={active} className={`flex items-center gap-2 border-r border-t-2 border-[#242424] px-4 text-xs ${active ? "border-t-[#ededed] bg-[#0a0a0a] text-[#a1a1a1]" : "border-t-transparent bg-black text-[#a1a1a1] hover:bg-[#ffffff1a] hover:text-[#ededed]"}`} onClick={onClick} role="tab" type="button">{children}</button>;
}

function WorkspaceAction({ children, disabled, onClick }: { children: ReactNode; disabled: boolean; onClick: () => void }) {
  return <button className="flex items-center gap-2 border-r border-[#242424] px-3 text-xs text-[#a1a1a1] hover:bg-[#ffffff1a] hover:text-[#ededed] disabled:text-[#878787]" disabled={disabled} onClick={onClick} type="button">{children}</button>;
}

function EvaluationReport({ onRun, report, running }: { onRun: (harness: "cassette" | "opencode") => Promise<void>; report: AuthoringEvalReport | null; running: boolean }) {
  if (!report) return <div className="flex h-full flex-col items-center justify-center gap-4 text-[#878787]"><p>No learner-persona evaluation has run yet.</p><Button disabled={running} onClick={() => void onRun("cassette")} size="sm">Run fixtures</Button></div>;
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><span className="text-[#a1a1a1]">{report.harness}</span><span>{Math.round(report.score * 100)}%</span></div>
    {report.lessons.map((lesson) => <div className="border border-[#242424]" key={lesson.id}>
      <div className="flex justify-between border-b border-[#242424] px-4 py-3"><span>{lesson.id}</span><span>{Math.round(lesson.score * 100)}%</span></div>
      {lesson.scenarios.map((scenario) => <div className="space-y-2 px-4 py-3" key={scenario.scenarioId}><p className="text-[#a1a1a1]">{scenario.scenarioId}</p>{scenario.assertions.map((assertion) => <p className="flex items-center gap-2 text-[#878787]" key={assertion.name}>{assertion.passed ? <Check className="size-3.5 text-emerald-400" /> : <X className="size-3.5 text-red-400" />}{assertion.name}</p>)}</div>)}
    </div>)}
    <Button disabled={running} onClick={() => void onRun("opencode")} size="sm"><Play className="size-3.5" /> Run with OpenCode</Button>
  </div>;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, withAuthoringWorkspace(init));
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

async function drainStream(url: string, init: RequestInit): Promise<void> {
  const response = await fetch(url, withAuthoringWorkspace(init));
  if (!response.ok) throw new Error(await response.text());
  const reader = response.body?.getReader();
  if (!reader) return;
  while (!(await reader.read()).done) { /* Transcript is projected after the native turn. */ }
}

function withAuthoringWorkspace(init: RequestInit = {}): RequestInit {
  const workspaceId = new URLSearchParams(window.location.search).get("workspace");
  if (!workspaceId) return init;
  const headers = new Headers(init.headers);
  headers.set("x-dojofoo-workspace", workspaceId);
  return { ...init, headers };
}

function authoringApi(path: string): string {
  if (typeof window === "undefined") return path;
  const workspaceId = new URLSearchParams(window.location.search).get("workspace");
  return workspaceId ? `${path}?workspace=${encodeURIComponent(workspaceId)}` : path;
}

function errorMessage(cause: unknown): string { return cause instanceof Error ? cause.message : String(cause); }

export function authoringFiles(
  workspace: AuthoringWorkspace,
  lesson: AuthoringWorkspace["lessons"][number] | null
): AuthoringFile[] {
  if (!lesson) return [
    { path: "dojo.yaml", label: "dojo.yaml", content: workspace.manifestSource },
    { path: "DOJO.md", label: "DOJO.md", content: workspace.courseGuidance },
  ];
  return [
    { path: lesson.briefingPath, label: "KATA.md", content: lesson.briefing },
    { path: lesson.senseiPath, label: lesson.senseiPath.endsWith(".mdx") ? "SENSEI.mdx" : "SENSEI.md", content: lesson.sensei },
    { path: lesson.evalPath, label: "Eval", content: lesson.evalDefinition },
  ];
}

export function authoringFileUrl(path: string): string {
  return `/api/authoring/files/${path.split("/").map(encodeURIComponent).join("/")}`;
}
