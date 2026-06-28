import { describe, expect, it } from "vitest";
import { avatarColor, initials } from "./avatar";

describe("initials", () => {
  it("handles empty / whitespace", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });

  it("uses first letters of two parts", () => {
    expect(initials("Taro Yamada")).toBe("TY");
  });

  it("uses first two chars of a single name", () => {
    expect(initials("alice")).toBe("AL");
  });
});

describe("avatarColor", () => {
  it("is deterministic for the same name", () => {
    expect(avatarColor("Taro")).toBe(avatarColor("Taro"));
  });

  it("returns a hex color from the palette", () => {
    expect(avatarColor("Hanako")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
