import { describe, expect, it } from "vitest";
import { avatarCatalog, countAvatarCombinations, createAvatar } from ".";

describe("ukiyo avatar generator", () => {
  it("resolves the same seed deterministically", () => {
    expect(createAvatar("senpai")).toEqual(createAvatar("senpai"));
    expect(createAvatar("senpai")).not.toEqual(createAvatar("sensei"));
  });

  it("counts every independent catalog combination", () => {
    expect(countAvatarCombinations()).toBe(20_736);
    expect(Object.keys(createAvatar("one"))).toEqual(Object.keys(avatarCatalog));
  });

  it("retains explicit customizations while reseeding other traits", () => {
    expect(createAvatar("one", { hair: "loose" }).hair).toBe("loose");
  });
});
