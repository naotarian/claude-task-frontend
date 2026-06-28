import { describe, expect, it } from "vitest";
import { filterTasks, isFilterActive } from "./filter";

function task(overrides: Partial<App.Data.TaskData>): App.Data.TaskData {
  return {
    id: 1, projectId: 1, taskStatusId: 1, taskCategoryId: null, categoryId: null, categoryName: null,
    seqNumber: 1, title: "task", description: null, assignees: [], reporterId: null, reporterName: null,
    parentTaskId: null, priority: "normal", progress: 0, dueDate: null, plannedStartDate: null,
    plannedEndDate: null, actualStartDate: null, actualEndDate: null, estimatedHours: null,
    actualHours: 0, customFields: [],
    ...overrides,
  } as unknown as App.Data.TaskData;
}

describe("filterTasks", () => {
  const tasks = [
    task({ id: 1, title: "ログイン実装", priority: "high", categoryId: 10, assignees: [{ id: 5, name: "A", avatarPath: null }] }),
    task({ id: 2, title: "テスト作成", priority: "low", categoryId: 20, assignees: [] }),
  ];

  it("returns all with empty filter", () => {
    expect(filterTasks(tasks, {})).toHaveLength(2);
  });

  it("filters by keyword (case-insensitive substring of title)", () => {
    expect(filterTasks(tasks, { keyword: "ログイン" }).map((t) => t.id)).toEqual([1]);
  });

  it("filters by priority", () => {
    expect(filterTasks(tasks, { priority: "low" }).map((t) => t.id)).toEqual([2]);
  });

  it("filters by category", () => {
    expect(filterTasks(tasks, { categoryId: 10 }).map((t) => t.id)).toEqual([1]);
  });

  it("filters by assignee", () => {
    expect(filterTasks(tasks, { assigneeUserId: 5 }).map((t) => t.id)).toEqual([1]);
  });

  it("combines filters", () => {
    expect(filterTasks(tasks, { priority: "high", categoryId: 10 })).toHaveLength(1);
    expect(filterTasks(tasks, { priority: "high", categoryId: 20 })).toHaveLength(0);
  });
});

describe("isFilterActive", () => {
  it("detects active filters", () => {
    expect(isFilterActive({})).toBe(false);
    expect(isFilterActive({ keyword: "  " })).toBe(false);
    expect(isFilterActive({ priority: "high" })).toBe(true);
    expect(isFilterActive({ categoryId: 3 })).toBe(true);
  });
});
