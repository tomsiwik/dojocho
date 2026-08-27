export type IntegrationCategory = string;

export type IntegrationTone = "blue" | "green" | "orange" | "rose" | "slate";

export type IntegrationItem = {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logoUrl: string;
  logoMode?: "adaptive" | "color";
  tone: IntegrationTone;
  installed?: boolean;
};

export const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "github",
    name: "GitHub",
    category: "Developer",
    description: "Connect repositories, issues, pull requests, and releases.",
    logoUrl:
      "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg",
    tone: "slate",
    installed: true,
  },
  {
    id: "linear",
    name: "Linear",
    category: "Developer",
    description: "Keep projects and issues synchronized with active workflows.",
    logoUrl:
      "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/linear.svg",
    tone: "blue",
    installed: true,
  },
  {
    id: "postgres",
    name: "Postgres",
    category: "Data",
    description: "Query production data through scoped, auditable actions.",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    logoMode: "color",
    tone: "green",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "Developer",
    description: "Deploy Workers and observe activity across the edge.",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cloudflare/cloudflare-original.svg",
    logoMode: "color",
    tone: "orange",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    description: "Send decisions to the right channel and collect approvals.",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg",
    logoMode: "color",
    tone: "rose",
    installed: true,
  },
  {
    id: "figma",
    name: "Figma",
    category: "Design",
    description: "Read files, comments, variables, and component metadata.",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
    logoMode: "color",
    tone: "rose",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    description: "Respond to subscription, invoice, and payment events.",
    logoUrl:
      "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/stripe.svg",
    tone: "blue",
  },
];
