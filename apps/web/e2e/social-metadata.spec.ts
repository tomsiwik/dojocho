import { expect, test } from "@playwright/test";

const imageUrl = "https://dojo.foo/og.webp";

async function expectSocialImage(page: import("@playwright/test").Page) {
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", imageUrl);
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/webp");
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /dojofoo/i);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", imageUrl);
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute("content", /dojofoo/i);
}

test("uses the dojofoo social card on the main website", async ({ page }) => {
  await page.goto("/");
  await expectSocialImage(page);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "dojofoo");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://dojo.foo");
});

test("uses the dojofoo social card with page metadata in the docs", async ({ page }) => {
  await page.goto("/docs");
  await expectSocialImage(page);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Usage");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Usage");
});

test("serves the social card as WebP", async ({ request }) => {
  const response = await request.get("/og.webp");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/webp");
});
