import { createFileRoute } from "@tanstack/react-router";
import { FeaturesBenefitsTriptych } from "@dojofoo/ui/premium/feature-sections/features-benefits-triptych";
import { HeroCenteredDemo } from "@dojofoo/ui/premium/hero-sections/hero-centered-demo";
import { IntegrationsLedger } from "@dojofoo/ui/premium/integrations/integrations-ledger";
import { LogoCloudGrid } from "@dojofoo/ui/premium/logo-cloud/logo-cloud-grid";
import { useMemo } from "react";
import { HeroInstallAction } from "@/components/hero-install-action";
import { DojoHeroPreview } from "@/components/landing/dojo-hero-preview";
import { FftOcean } from "@/components/landing/fft-ocean";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { loadMarketplaceCourses } from "@/lib/courses.functions";
import { getLearningCount } from "@/lib/learning-count";

export const Route = createFileRoute("/")({
  loader: async () => ({
    courses: await loadMarketplaceCourses(),
    learningCount: getLearningCount(),
  }),
  staleTime: 60_000,
  component: DojosPage,
});

function DojosPage() {
  const { courses, learningCount } = Route.useLoaderData();
  const topCourses = useMemo(() => [...courses]
    .sort((left, right) => left.trendingRank - right.trendingRank || right.installs - left.installs)
    .slice(0, 10), [courses]);
  const topCourseEntries = useMemo(() => topCourses.map((course) => ({
    id: course.id,
    name: course.name,
    category: course.repository,
    description: course.description,
    logoUrl: "/dojofoo.svg",
    tone: "slate" as const,
  })), [topCourses]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteNavigation />

      <div className="marketplace-lined-frame mx-auto max-w-(--fd-layout-width) px-4 sm:px-5">
        <div className="marketplace-lined-surface">
          <HeroCenteredDemo
            actions={<HeroInstallAction />}
            background={<FftOcean />}
            demo={<DojoHeroPreview />}
            demoClassName="px-5 pt-6 pb-0 sm:px-8 sm:pt-8 sm:pb-0 lg:px-12 lg:pt-10 lg:pb-0"
            promo={`${learningCount} people currently learning`}
            subtext={<>Your coding agent follows the course, watches your work,<br />and mentors you by adapting to how you learn best.<br />Install a dojo in any folder and start learning with your agent right away.</>}
            title={<>Agentic teaching<br />built around your learning</>}
          />

          <LogoCloudGrid
            className="border-border border-t [border-top-style:dashed]"
            logos={[
              {
                name: "OpenCode",
                imageClassName: "h-5 w-28",
                imageSrc: "/agents/opencode-wordmark.svg",
                showName: false,
              },
              {
                name: "Codex",
                imageClassName: "h-7 w-24 dark:invert",
                imageSrc: "/agents/codex.svg",
                showName: false,
              },
              {
                name: "Grok",
                imageClassName: "h-7 w-20 dark:invert",
                imageSrc: "/agents/grok.svg",
                showName: false,
              },
              {
                name: "Pi",
                imageClassName: "size-7",
                imageSrc: "/agents/pi.svg",
                showName: false,
              },
              {
                name: "Cursor",
                imageClassName: "h-6 w-24 dark:invert",
                imageSrc: "/agents/cursor.svg",
                showName: false,
              },
              {
                name: "FX",
                imageClassName: "size-6 dark:invert",
                imageSrc: "/agents/fx.svg",
                showName: false,
              },
            ]}
            slots={6}
            subtext={<>Use the coding harness you already trust. Claude Code <a className="underline underline-offset-4 hover:text-foreground" href="https://x.com/tomhacks/status/2093314914429362334" rel="noreferrer" target="_blank">not supported</a>.</>}
            title="Works with"
          />

          <FeaturesBenefitsTriptych
            className="border-border border-t [border-top-style:dashed]"
            description="A dojo connects authored material, your code, and live evidence so the agent can teach the lesson in front of it—not a generic approximation."
            eyebrow="Deliberate practice"
            items={[
              {
                title: "Practice with Katas",
                description: "Work through small challenges with an agent that helps you understand the next step without giving away the answer. Stuck? Ask your agent to work through it with you.",
              },
              {
                title: "Get certified & save progress",
                description: "Keep your work in Git. Commit what you’ve learned and pick up where you left off. Earn a certificate when you complete a course.",
              },
              {
                title: "Author your own course",
                description: "Turn what you know into lessons. Build exercises and teaching material together with an agent, then try them as a learner.",
              },
            ]}
            title="It's a learning loop"
          />

          <IntegrationsLedger
            actionHint="Installs into your current workspace"
            actionLabel={() => "Open dojo"}
            benefits={[
              "Practice inside a real project",
              "Learn with lesson-aware agent guidance",
              "Keep runs and progress connected",
            ]}
            className="border-border border-t [border-top-style:dashed]"
            description="The courses learners are practicing most right now, ranked by marketplace activity."
            eyebrow="Most favourite installs"
            integrations={topCourseEntries}
            onAction={(entry) => {
              const course = topCourses.find((candidate) => candidate.id === entry.id);
              if (course) window.location.assign(`/courses/${course.source}/${course.slug}`);
            }}
            showMarks={false}
            title="Top 10"
          />

          <SiteFooter />
        </div>
      </div>
    </main>
  );
}
