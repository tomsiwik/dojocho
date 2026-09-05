import { SITE_URL } from "./site";

export const SOCIAL_IMAGE_URL = `${SITE_URL}/og.webp`;
export const DEFAULT_SOCIAL_DESCRIPTION =
  "Agentic teaching built around your learning. Practice with katas, save your progress, and author your own course with your coding agent.";

interface SocialMetadataOptions {
  title: string;
  description: string;
  url: string;
  type?: "article" | "website";
}

export function socialMetadata({
  title,
  description,
  url,
  type = "website",
}: SocialMetadataOptions) {
  const imageAlt = "dojofoo — Agentic teaching built around your learning";

  return [
    { name: "description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "dojofoo" },
    { property: "og:locale", content: "en_US" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: SOCIAL_IMAGE_URL },
    { property: "og:image:secure_url", content: SOCIAL_IMAGE_URL },
    { property: "og:image:type", content: "image/webp" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@tomhacks" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: SOCIAL_IMAGE_URL },
    { name: "twitter:image:alt", content: imageAlt },
  ];
}
