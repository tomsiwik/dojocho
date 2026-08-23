import { createFileRoute } from "@tanstack/react-router";
import { LessonPage } from "./index";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  return <LessonPage requestedSessionId={sessionId} />;
}
