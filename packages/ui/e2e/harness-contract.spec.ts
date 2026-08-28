import { expect, test } from "@playwright/test";

type Course = {
  dojo: string;
  kata: string | null;
  selected: boolean;
  sessionId: string | null;
  workspaceName: string;
  workspaceId: string;
};

test("projects one native harness session through chat, checks, and recovery", async ({ page }) => {
  const courses = await page.request.get("/api/control/courses").then(async (response) => {
    expect(response.ok()).toBe(true);
    return response.json() as Promise<Course[]>;
  });
  const workspaceName = process.env.DOJO_E2E_WORKSPACE;
  const course = courses.find((candidate) =>
    candidate.kata && (workspaceName ? candidate.workspaceName === workspaceName : candidate.selected)
  );
  expect(course, "a selected lesson is required").toBeTruthy();

  await page.goto(course!.sessionId ? `/session/${course!.sessionId}` : `/course/${course!.workspaceId}`);
  const sessionId = course!.sessionId ?? await expect.poll(async () => {
    const refreshed = await page.request.get("/api/control/courses").then((response) => response.json() as Promise<Course[]>);
    return refreshed.find((candidate) => candidate.workspaceId === course!.workspaceId)?.sessionId ?? null;
  }, { timeout: 120_000 }).not.toBeNull().then(async () => {
    const refreshed = await page.request.get("/api/control/courses").then((response) => response.json() as Promise<Course[]>);
    return refreshed.find((candidate) => candidate.workspaceId === course!.workspaceId)!.sessionId!;
  });
  await page.goto(`/session/${sessionId}`);
  const composer = page.getByLabel("Message the sensei");
  await expect(composer).toBeEnabled();

  const marker = `harness-e2e-${Date.now()}`;
  const senseiMessages = page.getByTestId("sensei-streaming-message");
  const beforeMessage = await senseiMessages.count();
  await composer.fill(`Briefly acknowledge this test marker without using tools: ${marker}`);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(senseiMessages).toHaveCount(beforeMessage + 1, { timeout: 120_000 });
  await expect(senseiMessages.last()).toContainText(marker);
  await expect(composer).toBeEnabled({ timeout: 120_000 });

  const summaries = page.getByTestId("chat-pane").getByText(/\d+ of \d+ tests passed/);
  const beforeCheck = await summaries.count();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(summaries).toHaveCount(beforeCheck + 1, { timeout: 60_000 });
  await expect(composer).toBeEnabled({ timeout: 120_000 });

  await page.reload();
  await expect(page).toHaveURL(/\/session\/[^/]+$/);
  await expect(page.getByTestId("chat-pane")).toContainText(marker, { timeout: 120_000 });
  await expect(page.getByTestId("sensei-streaming-message").filter({ hasText: marker })).toHaveCount(1);
  await expect(page.getByTestId("chat-pane").getByText(/\d+ of \d+ tests passed/).last()).toBeVisible();
  await expect(page.getByTestId("chat-pane")).not.toContainText("dojo://");
});
