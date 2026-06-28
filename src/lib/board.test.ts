import { describe, expect, it } from "vitest";
import { groupTasksByStatus, taskCountForStatus, visibleStatuses } from "./board";

function status(id: number, position: number, isHidden = false): App.Data.TaskStatusData {
  return { id, name: `s${id}`, color: "#fff", category: "todo", position, isHidden, isProtected: false };
}

function task(id: number, statusId: number): App.Data.TaskData {
  return {
    id, projectId: 1, taskStatusId: statusId, seqNumber: id, title: `t${id}`,
    description: null, assignees: [], reporterId: null, reporterName: null, parentTaskId: null,
    priority: "normal", progress: 0, dueDate: null, plannedStartDate: null,
    plannedEndDate: null, actualStartDate: null, actualEndDate: null,
    estimatedHours: null, actualHours: 0,
  } as unknown as App.Data.TaskData;
}

describe("visibleStatuses", () => {
  it("filters hidden and sorts by position", () => {
    const result = visibleStatuses([status(1, 2), status(2, 0), status(3, 1, true)]);
    expect(result.map((s) => s.id)).toEqual([2, 1]);
  });
});

describe("groupTasksByStatus", () => {
  it("groups tasks by status id", () => {
    const groups = groupTasksByStatus([task(1, 10), task(2, 10), task(3, 20)]);
    expect(groups[10]).toHaveLength(2);
    expect(groups[20]).toHaveLength(1);
  });
});

describe("taskCountForStatus", () => {
  it("counts tasks in a status", () => {
    expect(taskCountForStatus([task(1, 10), task(2, 20)], 10)).toBe(1);
  });
});
