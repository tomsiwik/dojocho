import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  Card,
  CardAction,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

type CourseCardProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  footer: ReactNode;
  footerClassName?: string;
  href?: string;
  label: string;
  onClick?: () => void;
  testId?: string;
};

function CourseCard({ eyebrow, title, description, action, footer, footerClassName, href, label, onClick, testId }: CourseCardProps) {
  return (
    <Card
      className="group/course min-h-[10.5rem] overflow-hidden border border-border/60 bg-surface-1 pb-0 transition-colors duration-80 hover:border-primary"
      data-testid={testId}
      href={href}
      label={label}
      onClick={onClick}
      size="compact"
    >
      <CardHeader className="px-4 pt-4">
        <CardEyebrow>{eyebrow}</CardEyebrow>
        <CardTitle className="font-display text-lg font-medium leading-tight">{title}</CardTitle>
        <CardDescription className="line-clamp-2 pb-5 font-prose">{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardFooter className={cn("mt-auto border-t border-dashed border-border px-4 py-3", footerClassName)}>
        {footer}
      </CardFooter>
    </Card>
  );
}

export { CourseCard };
export type { CourseCardProps };
