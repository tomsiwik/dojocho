import { createFileRoute } from "@tanstack/react-router";
import { LessonPage } from "./index";

export const Route = createFileRoute("/course/$workspaceId")({
  component: CoursePage,
});

function CoursePage() {
  const { workspaceId } = Route.useParams();
  return <LessonPage requestedWorkspaceId={workspaceId} />;
}
