import { describe, expect, it } from "vitest";
import { computeGanttRange, ganttBarStyle, summarizeEffort } from "./gantt";

function task(overrides: Partial<App.Data.TaskData>): App.Data.TaskData {
  return {
    id: 1,
    projectId: 1,
    taskStatusId: 1,
    seqNumber: 1,
    title: "t",
    description: null,
    categoryId: null,
    categoryName: null,
    assignees: [],
    reporterId: null,
    reporterName: null,
    parentTaskId: null,
    priority: "normal",
    progress: 0,
    dueDate: null,
    plannedStartDate: null,
    plannedEndDate: null,
    actualStartDate: null,
    actualEndDate: null,
    estimatedHours: null,
    actualHours: 0,
    customFields: [],
    ...overrides,
  };
}

describe("computeGanttRange", () => {
  it("returns null with no dates", () => {
    expect(computeGanttRange([task({})])).toBeNull();
  });

  it("computes min start and max end", () => {
    const range = computeGanttRange([
      task({ plannedStartDate: "2026-07-01", plannedEndDate: "2026-07-10" }),
      task({ actualStartDate: "2026-07-05", actualEndDate: "2026-07-20" }),
    ]);
    expect(range).not.toBeNull();
    expect(range!.start.toISOString().slice(0, 10)).toBe("2026-07-01");
    expect(range!.end.toISOString().slice(0, 10)).toBe("2026-07-20");
  });
});

describe("ganttBarStyle", () => {
  const range = { start: new Date("2026-07-01"), end: new Date("2026-07-11") };

  it("returns null without a start", () => {
    expect(ganttBarStyle(null, "2026-07-05", range)).toBeNull();
  });

  it("computes left/width percentages", () => {
    const style = ganttBarStyle("2026-07-01", "2026-07-06", range);
    expect(style).not.toBeNull();
    expect(style!.left).toBe("0%");
    expect(parseFloat(style!.width)).toBeGreaterThan(0);
  });
});

describe("summarizeEffort", () => {
  it("totals estimated and actual hours and variance", () => {
    const summary = summarizeEffort([
      task({ estimatedHours: 5, actualHours: 6 }),
      task({ estimatedHours: null, actualHours: 2 }),
    ]);
    expect(summary.estimatedTotal).toBe(5);
    expect(summary.actualTotal).toBe(8);
    expect(summary.variance).toBe(3);
    expect(summary.rows).toHaveLength(2);
  });
});
