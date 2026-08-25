import {
  CourseCard as CourseCardFrame,
  InputCopy,
} from "@dojofoo/ui";
import type { MarketplaceCourse } from "@/lib/courses";

export function CourseCard({ course }: { course: MarketplaceCourse }) {
  return (
    <CourseCardFrame
      action={<span className="font-mono text-[11px] text-muted-foreground">v{course.version}</span>}
      description={course.description}
      eyebrow={course.repository}
      footer={(
        <InputCopy
          value={`npx dojofoo add ${course.installUrl}`}
          variant="icon"
          size="compact"
          className="w-full"
        />
      )}
      footerClassName="block"
      href={`/courses/${course.source}/${course.slug}`}
      label={`Open ${course.name}`}
      testId={`course-${course.slug}`}
      title={course.name}
    />
  );
}
