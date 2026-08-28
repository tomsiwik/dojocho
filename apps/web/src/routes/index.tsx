import { createFileRoute } from "@tanstack/react-router";
import { CardGroup, Select, SelectContent, SelectItem, SelectTrigger } from "@dojofoo/ui";
import { FeaturesBenefitsTriptych } from "@dojofoo/ui/premium/feature-sections/features-benefits-triptych";
import { HeroCenteredDemo } from "@dojofoo/ui/premium/hero-sections/hero-centered-demo";
import { IntegrationsLedger } from "@dojofoo/ui/premium/integrations/integrations-ledger";
import { LogoCloudGrid } from "@dojofoo/ui/premium/logo-cloud/logo-cloud-grid";
import { ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { HeroInstallAction } from "@/components/hero-install-action";
import { DojoHeroPreview } from "@/components/landing/dojo-hero-preview";
import { CourseCard } from "@/components/marketplace/course-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { loadMarketplaceCourses } from "@/lib/courses.functions";

export const Route = createFileRoute("/")({
  loader: () => loadMarketplaceCourses(),
  staleTime: 60_000,
  component: DojosPage,
});

function DojosPage() {
  const courses = Route.useLoaderData();
  const [styleFilter, setStyleFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [courseQuery, setCourseQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const languages = useMemo(
    () => [...new Set(courses.map((course) => course.language))].sort(),
    [courses],
  );
  const frameworks = useMemo(
    () => [...new Set(courses.flatMap((course) => course.framework ? [course.framework] : []))].sort(),
    [courses],
  );
  const visibleCourses = useMemo(() => courses
    .filter((course) => styleFilter === "all" || course.mode === styleFilter)
    .filter((course) => languageFilter === "all" || course.language === languageFilter)
    .filter((course) => frameworkFilter === "all" || course.framework === frameworkFilter)
    .filter((course) => {
      const query = courseQuery.trim().toLowerCase();
      if (!query) return true;
      return [course.name, course.description, course.repository, course.language, course.framework, ...course.tags]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    })
    .sort((left, right) => {
      if (sortBy === "newest") {
        return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      }
      if (sortBy === "trending") return left.trendingRank - right.trendingRank;
      return right.installs - left.installs;
    }), [courseQuery, courses, frameworkFilter, languageFilter, sortBy, styleFilter]);
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
            demo={<DojoHeroPreview />}
            demoClassName="px-5 pt-6 pb-0 sm:px-8 sm:pt-8 sm:pb-0 lg:px-12 lg:pt-10 lg:pb-0"
            promo="87 people currently learning"
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
              { name: "Pi", imageSrc: "/agents/pi.svg", showName: false },
            ]}
            slots={3}
            subtext="Use the coding harness you already trust."
            title="Works with"
          />

          <FeaturesBenefitsTriptych
            className="border-border border-t [border-top-style:dashed]"
            description="A dojo connects authored material, your code, and live evidence so the agent can teach the lesson in front of it—not a generic approximation."
            eyebrow="Deliberate practice"
            items={[
              {
                title: "Install once, learn in place",
                description: "Add a dojo to a real workspace and let its setup prepare the tools, material, and runtime the course needs.",
              },
              {
                title: "Work with a sensei",
                description: "Your agent sees the lesson and current evidence, then teaches with focused questions, explanations, and useful restraint.",
              },
              {
                title: "Keep the learning thread",
                description: "Runs, lesson progress, and harness sessions stay connected so you can stop, return, and continue where the work is.",
              },
            ]}
            title="A learning loop around your real work."
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

          <section className="flex min-h-[calc(100vh-4rem)] flex-col border-border border-t [border-top-style:dashed]" id="dojos">
          <div className="flex min-w-0 flex-1 flex-col px-5 py-12 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-medium tracking-tight">All dojos</h1>
              <p className="mt-3 font-prose text-base leading-7 text-muted-foreground">
                Dojos are AI-assisted courses. Add them via CLI and let your agent guide you through katas, learning material, and interactive teaching dialogues.
              </p>
            </div>

            <div className="mt-9 grid flex-1 border-y border-dashed border-border lg:grid-cols-[15rem_minmax(0,1fr)]">
              <aside className="border-border border-b py-5 [border-bottom-style:dashed] lg:border-r lg:border-b-0 lg:[border-right-style:dashed]">
                <MarketplaceFilterGroup
                  label="Teaching style"
                  onValueChange={setStyleFilter}
                  options={[
                    { label: "Any style", value: "all" },
                    { label: "Katas", value: "katas" },
                    { label: "Interactive", value: "interactive" },
                  ]}
                  value={styleFilter}
                />
                <MarketplaceFilterGroup
                  className="mt-7"
                  label="Language"
                  onValueChange={setLanguageFilter}
                  options={[
                    { label: "Any language", value: "all" },
                    ...languages.map((language) => ({ label: language, value: language })),
                  ]}
                  value={languageFilter}
                />
                {frameworks.length ? (
                  <MarketplaceFilterGroup
                    className="mt-7"
                    label="Framework"
                    onValueChange={setFrameworkFilter}
                    options={[
                      { label: "Any framework", value: "all" },
                      ...frameworks.map((framework) => ({ label: framework, value: framework })),
                    ]}
                    value={frameworkFilter}
                  />
                ) : null}
              </aside>

              <div className="min-w-0">
                <div className="flex items-stretch border-border border-b [border-bottom-style:dashed]">
                  <label className="relative min-w-0 flex-1">
                    <span className="sr-only">Search courses</span>
                    <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="h-12 w-full bg-background pr-5 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:bg-muted/30"
                      onChange={(event) => setCourseQuery(event.target.value)}
                      placeholder="Search dojos"
                      type="search"
                      value={courseQuery}
                    />
                  </label>
                  <div className="flex items-center border-border border-l px-2 [border-left-style:dashed]">
                    <Select value={sortBy} onValueChange={setSortBy} size="compact">
                      <SelectTrigger aria-label="Sort dojos" icon={ArrowUpDown} className="min-w-[9.5rem]" />
                      <SelectContent>
                        <SelectItem index={0} value="newest">Newest</SelectItem>
                        <SelectItem index={1} value="popularity">Popularity</SelectItem>
                        <SelectItem index={2} value="trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="min-w-0 p-5 lg:p-7">
                  {visibleCourses.length > 0 ? (
                    <CardGroup columns={3} separated proximityHover={false} border="outlined" className="grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {visibleCourses.map((course) => <CourseCard key={course.id} course={course} />)}
                    </CardGroup>
                  ) : (
                    <div className="grid min-h-52 place-items-center border border-dashed border-border p-6 text-center">
                      <div>
                        <p className="font-medium">No dojos found</p>
                        <button
                          className="mt-2 px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
                          onClick={() => {
                            setStyleFilter("all");
                            setLanguageFilter("all");
                            setFrameworkFilter("all");
                            setCourseQuery("");
                          }}
                          type="button"
                        >
                          Clear filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </section>
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}

type MarketplaceFilterOption = {
  label: string;
  value: string;
};

function MarketplaceFilterGroup({
  className = "",
  label,
  onValueChange,
  options,
  value,
}: {
  className?: string;
  label: string;
  onValueChange: (value: string) => void;
  options: readonly MarketplaceFilterOption[];
  value: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <p className="px-4 font-display text-xs font-medium text-muted-foreground uppercase tracking-[0.14em]">
        {label}
      </p>
      <div className="mt-2 flex flex-col">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              aria-pressed={active}
              className={`px-4 py-1.5 text-left text-sm transition-colors ${active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              key={option.value}
              onClick={() => onValueChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
