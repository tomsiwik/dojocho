import { createFileRoute } from "@tanstack/react-router";
import { LessonPage } from "./index";

export const Route = createFileRoute("/course/$workspaceId/$courseId/lesson/$lessonId")({
  component: CourseLessonPage,
});

function CourseLessonPage() {
  const { courseId, lessonId, workspaceId } = Route.useParams();
  return (
    <LessonPage
      requestedCourseId={courseId}
      requestedLessonId={lessonId}
      requestedWorkspaceId={workspaceId}
    />
  );
}
