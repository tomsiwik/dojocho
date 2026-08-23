export type RunQuestion = {
  title: string;
  options: Array<{ id: string; title: string; description?: string }>;
};

type QuestionHandler = (question: RunQuestion) => Promise<Record<string, string[]>>;

export class RunCoordinator {
  private readonly questions = new Map<string, QuestionHandler>();

  attach(capability: string, handler: QuestionHandler): void {
    this.questions.set(capability, handler);
  }

  detach(capability: string): void {
    this.questions.delete(capability);
  }

  ask(capability: string, question: RunQuestion): Promise<Record<string, string[]>> {
    const handler = this.questions.get(capability);
    if (!handler) return Promise.reject(new Error("The lesson run is no longer active"));
    return handler(question);
  }
}

const coordinatorKey = Symbol.for("dojofoo.run-coordinator");
const globalCoordinator = globalThis as typeof globalThis & { [coordinatorKey]?: RunCoordinator };

export const runCoordinator = globalCoordinator[coordinatorKey] ??= new RunCoordinator();
