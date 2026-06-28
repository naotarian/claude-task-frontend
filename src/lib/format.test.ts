import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatDate,
  formatHours,
  priorityLabel,
  roleLabel,
  storageUsagePercent,
} from "./format";

describe("formatBytes", () => {
  it("formats zero and negatives", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
  });

  it("formats bytes, KB, MB, GB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(3 * 1024 ** 3)).toBe("3.0 GB");
  });
});

describe("formatDate", () => {
  it("returns dash for empty/invalid", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats ISO dates", () => {
    expect(formatDate("2026-07-31")).toBe("2026/07/31");
  });
});

describe("formatHours", () => {
  it("handles null and numbers", () => {
    expect(formatHours(null)).toBe("—");
    expect(formatHours(3.5)).toBe("3.5h");
  });
});

describe("labels", () => {
  it("maps priority and role labels", () => {
    expect(priorityLabel("high")).toBe("高");
    expect(roleLabel("owner")).toBe("オーナー");
    expect(roleLabel(null)).toBe("—");
    expect(roleLabel("unknown")).toBe("unknown");
  });
});

describe("storageUsagePercent", () => {
  it("returns null when unlimited", () => {
    expect(storageUsagePercent(100, null)).toBeNull();
  });

  it("computes and caps at 100", () => {
    expect(storageUsagePercent(50, 100)).toBe(50);
    expect(storageUsagePercent(200, 100)).toBe(100);
  });
});
