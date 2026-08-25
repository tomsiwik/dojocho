import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  type ReasoningMessagePartProps,
  type ToolCallMessagePartProps,
} from "@assistant-ui/react";
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui";
import { useEffect, useMemo, useState } from "react";
import { Composer, ComposerActions, ComposerBar, ComposerContext, ComposerSend, ComposerToolbar } from "../components/elements/composer";
import { ReasoningPanel } from "../components/elements/reasoning-panel";
import { ThinkingIndicator } from "../components/elements/thinking-indicator";
import { ToolCall } from "../components/elements/tool-call";
import { ApprovalCard } from "../components/elements/approval-card";
import { ElicitationForm } from "../components/elements/elicitation-form";
import { AgentPlan } from "../components/elements/agent-plan";
import { JobProgress } from "../components/elements/job-progress";
import { MessageQueue } from "../components/elements/message-queue";
import { ConnectionState } from "../components/elements/connection-state";
import { StreamingText } from "../components/elements/streaming-text";
import { TerminalBlock } from "../components/elements/terminal-block";
import { AgentCard } from "../components/elements/agent-card";
import { CodeDiff } from "../components/elements/code-diff";
import { InlineCitation } from "../components/elements/inline-citation";
import { MathBlock, Frac, Sup } from "../components/elements/math-block";
import { MessageTiming } from "../components/elements/message-timing";
import { NumberTicker } from "../components/elements/number-ticker";
import { PermissionGrant, type GrantScope } from "../components/elements/permission-grant";
import { QuotaBanner } from "../components/elements/quota-banner";
import { ReasoningEffort } from "../components/elements/reasoning-effort";
import { RecommendationCard } from "../components/elements/recommendation-card";
import { ReviewableDiff, type DiffHunk } from "../components/elements/reviewable-diff";
import { createCassetteAgent, LESSON_CASSETTE } from "./ag-ui-cassette";
import { SESSION_COMPLETION_TIMEOUT_CASSETTE } from "./session-completion-timeout-cassette";

interface ChatShowcaseProps {
  autoplay: boolean;
  speed: number;
}

function StoryFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen min-h-0 items-center justify-center overflow-hidden p-4">
      <section className="border-border bg-background aspect-[1/1.618] h-[min(92vh,760px)] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden border">
        {children}
      </section>
    </main>
  );
}

function AutoStart({ enabled }: { enabled: boolean }) {
  const aui = useAui();
  useEffect(() => {
    if (!enabled || !aui.thread.getState().isEmpty) return;
    void aui.thread.append({
      role: "user",
      content: [{ type: "text", text: "Can you check my latest attempt?" }],
    });
  }, [aui, enabled]);
  return null;
}

function ReasoningPart({ text, status }: ReasoningMessagePartProps) {
  const [open, setOpen] = useState(true);
  const streaming = status.type === "running";
  return (
    <ReasoningPanel
      className="max-w-none"
      steps={[{ title: "Analyzing lesson state", body: text }]}
      visibleSteps={1}
      streaming={streaming}
      open={open}
      onOpenChange={setOpen}
      restingLabel="Worked"
    />
  );
}

function ToolPart({ toolName, args, result, status }: ToolCallMessagePartProps) {
  const [open, setOpen] = useState(true);
  const running = status.type === "running";
  const renderedResult = result === undefined ? "Waiting for result…" : typeof result === "string" ? result : JSON.stringify(result, null, 2);
  const failed = /(?:error|failed|timed out)/iu.test(renderedResult);
  const completion = toolName === "dojofoo_dojo_lesson_complete";
  return (
    <ToolCall
      className="max-w-none"
      label={failed ? "Completion prompt failed" : completion ? "Asked how to continue" : "Checked lesson"}
      activeLabel={completion ? "Asking how to continue" : "Checking lesson"}
      query={toolName}
      request={JSON.stringify(args, null, 2)}
      result={renderedResult}
      running={running}
      error={failed}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="mx-auto w-full max-w-xl">
      <div className="flex w-full flex-col gap-3 text-sm leading-relaxed">
        <MessagePrimitive.Parts
          components={{ Reasoning: ReasoningPart, tools: { Fallback: ToolPart } }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="mx-auto flex w-full max-w-xl justify-end">
      <div className="bg-muted max-w-[85%] px-3 py-2 text-sm">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function RuntimeComposer() {
  const running = useAuiState((state) => state.thread.isRunning);
  const empty = useAuiState((state) => state.composer.isEmpty);
  return (
    <ComposerPrimitive.Root>
      <Composer className="max-w-none">
        <ComposerBar>
          <ComposerPrimitive.Input
            placeholder="Message the sensei…"
            className="placeholder:text-foreground/35 min-h-11 w-full resize-none bg-transparent px-3 py-3 text-[15px] caret-blue-500 outline-none"
          />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerContext usage={{ system: 8, tools: 4, messages: 12, total: 64 }} />
            </ComposerActions>
            {running ? (
              <ComposerPrimitive.Cancel asChild>
                <ComposerSend streaming idle={false} />
              </ComposerPrimitive.Cancel>
            ) : (
              <ComposerPrimitive.Send asChild>
                <ComposerSend streaming={false} idle={empty} />
              </ComposerPrimitive.Send>
            )}
          </ComposerToolbar>
        </ComposerBar>
      </Composer>
    </ComposerPrimitive.Root>
  );
}

function ProtocolChat({ autoplay, cassette = LESSON_CASSETTE, speed }: ChatShowcaseProps & { cassette?: readonly import("./ag-ui-cassette").CassetteEvent[] }) {
  const agent = useMemo(() => createCassetteAgent(cassette, speed), [cassette, speed]);
  const runtime = useAgUiRuntime({ agent, showThinking: true });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AutoStart enabled={autoplay} />
      <StoryFrame>
        <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col">
          <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth px-5 pt-5">
            <div className="flex flex-col gap-5 pb-6">
              <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
            </div>
            <ThreadPrimitive.ViewportFooter className="bg-background sticky bottom-0 mt-auto pb-5 pt-3">
              <RuntimeComposer />
            </ThreadPrimitive.ViewportFooter>
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </StoryFrame>
    </AssistantRuntimeProvider>
  );
}

function useFrame(speed: number, total: number) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setFrame((current) => (current >= total ? current : current + 1)),
      900 / speed,
    );
    return () => window.clearInterval(timer);
  }, [speed, total]);
  return frame;
}

function LongRunning({ speed }: ChatShowcaseProps) {
  const frame = useFrame(speed, 6);
  return (
    <StoryFrame>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <p className="ml-auto bg-muted max-w-[85%] px-3 py-2 text-sm">Prepare this course and run its checks.</p>
            {frame < 1 && <ThinkingIndicator label="Planning course setup" elapsed="1s" />}
            {frame >= 1 && <AgentCard className="max-w-none" name="Dojo Sensei" description="A lesson-scoped teaching agent connected through the AG-UI runtime." provider="OpenCode via ACP" version="1.0" model="glm-5" endpoint="dojofoo://agent/current" skills={[{ name: "dojofoo", description: "Lesson checks and learner prompts" }]} connected onConnect={() => undefined} />}
            {frame >= 1 && <AgentPlan className="max-w-none" steps={["Inspect course metadata", "Prepare dependencies", "Run lesson checks"]} activeIndex={Math.min(frame - 1, 3)} />}
            {frame >= 2 && <ReasoningEffort className="max-w-none" levels={[{ key: "low", label: "Low", budget: 2048 }, { key: "medium", label: "Medium", budget: 8192 }, { key: "high", label: "High", budget: 16_384 }]} selectedKey="medium" spent={frame * 820} />}
            {frame >= 2 && <TerminalBlock className="max-w-none" command="mise install" lines={["python@3.13 installed", "node@24 installed", "dependencies ready"]} visibleCount={Math.min(frame - 1, 3)} done={frame >= 5} />}
            {frame >= 3 && <JobProgress className="max-w-none" title="Preparing interactive course" stages={[{ name: "tools", weight: 1 }, { name: "deps", weight: 2 }, { name: "checks", weight: 1 }]} stageIndex={Math.min(frame - 3, 3)} stageProgress={0.7} eta="12s" />}
            {frame === 4 && <ConnectionState className="max-w-none" phase="reconnecting" attempt={2} />}
            {frame >= 5 && <MessageQueue className="max-w-none" running="Summarize the current lesson" queued={[{ id: "1", text: "Then show the next lesson" }, { id: "2", text: "Save a checkpoint" }]} />}
            {frame >= 6 && <StreamingText className="max-w-none" segments={[{ text: "The course is ready. All dependencies are installed and the first lesson can begin." }]} count={14} streaming={false} />}
            {frame >= 6 && <MessageTiming className="max-w-none" stats={[{ label: "worked", value: "8.4s" }, { label: "first token", value: "420ms" }, { label: "tokens", value: "184" }]} />}
            {frame >= 6 && <QuotaBanner className="max-w-none" used={82} limit={100} unit="runs" resetsIn="6 days" upgradeLabel="View usage" />}
          </div>
        </div>
        <div className="bg-background shrink-0 px-5 pb-5 pt-3"><Composer className="mx-auto max-w-xl"><ComposerBar><div className="text-foreground/35 min-h-11 px-3 py-3 text-[15px]">Message the sensei…</div><ComposerToolbar><span /><ComposerSend streaming={frame < 6} idle /></ComposerToolbar></ComposerBar></Composer></div>
      </div>
    </StoryFrame>
  );
}

function HumanInTheLoop({ speed }: ChatShowcaseProps) {
  const frame = useFrame(speed, 4);
  const [approved, setApproved] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [scope, setScope] = useState<GrantScope | "pending">("pending");
  return (
    <StoryFrame>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <p className="ml-auto bg-muted max-w-[85%] px-3 py-2 text-sm">Install the lesson tools and continue.</p>
            {frame < 1 && <ThinkingIndicator label="Checking required permissions" />}
            {frame >= 1 && <ApprovalCard className="max-w-none" state={approved ? "done" : "request"} command="mise install" title="Run a local command?" subtitle="The course requested dependency setup" onAllowOnce={() => setApproved(true)} onAlwaysAllow={() => setApproved(true)} onDeny={() => setApproved(false)} />}
            {frame >= 1 && <PermissionGrant className="max-w-none" capability="Control the lesson UI" requester="Dojo Sensei" reach={["Show learner prompts", "Advance the current lesson"]} scope={scope} onGrant={setScope} />}
            {frame >= 2 && <ElicitationForm className="max-w-none" server="dojofoo" message="Choose how you want to continue this lesson." fields={[{ name: "next", label: "Next step", value: "Move on", kind: "choice", options: ["Review", "Move on", "Pause"], required: true }]} state={accepted ? "accepted" : "request"} onAccept={() => setAccepted(true)} onDecline={() => setAccepted(false)} />}
            {frame >= 3 && <StreamingText className="max-w-none" segments={[{ text: "Your response is returned to the same AG-UI run so the agent can continue without a second transport." }]} count={Math.min((frame - 2) * 8, 16)} streaming={frame < 4} />}
          </div>
        </div>
        <div className="bg-background shrink-0 px-5 pb-5 pt-3"><Composer className="mx-auto max-w-xl"><ComposerBar><div className="text-foreground/35 min-h-11 px-3 py-3 text-[15px]">Message the sensei…</div><ComposerToolbar><span /><ComposerSend streaming={frame < 4} idle /></ComposerToolbar></ComposerBar></Composer></div>
      </div>
    </StoryFrame>
  );
}

function RichLessonArtifacts({ speed }: ChatShowcaseProps) {
  const frame = useFrame(speed, 6);
  const [citation, setCitation] = useState<number | null>(null);
  const [recommended, setRecommended] = useState(false);
  const [hunks, setHunks] = useState<DiffHunk[]>([
    { id: "one", range: "@@ normalizeHandle", decision: "pending", lines: [{ kind: "removed", text: "return input.trim();" }, { kind: "added", text: "return input.trim().toLowerCase();" }] },
  ]);
  const decide = (decision: "kept" | "discarded") => setHunks((items) => items.map((hunk) => ({ ...hunk, decision })));
  return (
    <StoryFrame>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <p className="ml-auto bg-muted max-w-[85%] px-3 py-2 text-sm">Show me why this transformation works.</p>
            {frame < 1 && <ThinkingIndicator label="Preparing lesson artifacts" />}
            {frame >= 1 && <InlineCitation className="max-w-none" sources={[{ domain: "developer.mozilla.org", title: "String.prototype.trim", snippet: "Removes whitespace from both ends of a string." }, { domain: "developer.mozilla.org", title: "Regular expressions", snippet: "Patterns describe character classes and repetitions." }]} openIndex={citation} onOpenIndexChange={setCitation} />}
            {frame >= 2 && <CodeDiff className="max-w-none" filename="katas/001/solution.ts" additions={1} deletions={1} cycle={frame} lines={[{ kind: "removed", text: "return input;" }, { kind: "added", text: "return input.trim();" }, { kind: "context", text: "}" }]} />}
            {frame >= 3 && <MathBlock className="max-w-none" label="coverage" visibleSteps={2} steps={[{ expression: <><Frac over="passed" under="total" /> × 100</>, note: "lesson check coverage" }, { expression: <>3 ÷ 4 = 75<Sup>%</Sup></>, note: "current result" }]} />}
            {frame >= 4 && <RecommendationCard className="max-w-none" state={recommended ? "accepted" : "idle"} question="Review the transformation boundary?" confidenceLabel="high confidence" acceptedLabel="Review selected" onAccept={() => setRecommended(true)} onAlternatives={() => undefined}>A focused review can explain why the pure function is easier to test without revealing the remaining answer.</RecommendationCard>}
            {frame >= 5 && <ReviewableDiff className="max-w-none" filename="katas/001/solution.ts" hunks={hunks} onKeep={() => decide("kept")} onDiscard={() => decide("discarded")} onApply={() => undefined} />}
            {frame >= 6 && <div className="flex justify-center"><NumberTicker value={75} label="percent covered" /></div>}
          </div>
        </div>
        <div className="bg-background shrink-0 px-5 pb-5 pt-3"><Composer className="mx-auto max-w-xl"><ComposerBar><div className="text-foreground/35 min-h-11 px-3 py-3 text-[15px]">Message the sensei…</div><ComposerToolbar><span /><ComposerSend streaming={frame < 6} idle /></ComposerToolbar></ComposerBar></Composer></div>
      </div>
    </StoryFrame>
  );
}

const meta = {
  title: "Chat/Streamed use cases",
  component: ProtocolChat,
  parameters: { layout: "fullscreen" },
  args: { autoplay: true, speed: 1 },
  argTypes: {
    autoplay: { control: "boolean" },
    speed: { control: { type: "range", min: 0.5, max: 4, step: 0.5 } },
  },
} satisfies Meta<typeof ProtocolChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProtocolKitchenSink: Story = {};
export const CapturedCompletionTimeout: Story = {
  render: (args) => <ProtocolChat {...args} cassette={SESSION_COMPLETION_TIMEOUT_CASSETTE} />,
};
export const LongRunningAgent: Story = { render: (args) => <LongRunning {...args} /> };
export const HumanInputAndApproval: Story = { render: (args) => <HumanInTheLoop {...args} /> };
export const RichLessonOutput: Story = { render: (args) => <RichLessonArtifacts {...args} /> };
