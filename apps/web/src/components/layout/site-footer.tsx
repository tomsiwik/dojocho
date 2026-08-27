import { BrandLogo } from "@dojofoo/ui/brand-logo";

const columns = [
  {
    title: "Learn",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "CLI", href: "/docs/cli" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Dojos", href: "/#dojos" },
      { label: "Add a dojo", href: "/docs/authoring" },
      { label: "Roadmap", href: "https://github.com/tomsiwik/dojofoo/blob/main/ROADMAP.md" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: "https://github.com/tomsiwik/dojofoo" },
      { label: "Issues", href: "https://github.com/tomsiwik/dojofoo/issues" },
      { label: "License", href: "https://github.com/tomsiwik/dojofoo/blob/main/LICENSE" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="w-full border-border border-t [border-top-style:dashed]">
      <div className="grid grid-cols-2 border-border md:grid-cols-4">
        <div className="border-border border-r border-b [border-right-style:dashed] [border-bottom-style:dashed] p-6">
          <BrandLogo className="h-7 w-auto" />
          <p className="mt-4 max-w-64 text-muted-foreground text-sm leading-6">
            Deliberate practice, guided by the coding agent you already use.
          </p>
        </div>
        {columns.map((column) => (
          <div className="border-border border-r border-b [border-right-style:dashed] [border-bottom-style:dashed] p-6 last:border-r-0" key={column.title}>
            <p className="font-display text-[11px] font-medium text-muted-foreground uppercase tracking-[0.14em]">
              {column.title}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 pl-0">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a className="text-foreground text-sm transition-colors hover:text-primary" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-start justify-between gap-2 border-border border-b [border-bottom-style:dashed] px-6 py-5 font-display text-[10px] font-medium text-muted-foreground uppercase tracking-[0.14em] sm:flex-row sm:items-center">
        <span>© dojofoo</span>
        <span>Learn with your own agent</span>
      </div>
    </footer>
  );
}
