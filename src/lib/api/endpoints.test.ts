import { describe, expect, it } from "vitest";
import { toSnake } from "./transform";

describe("toSnake", () => {
  it("maps known camelCase fields to snake_case", () => {
    expect(
      toSnake({
        taskStatusId: 3,
        assigneeUserIds: [7, 8],
        reporterUserId: 9,
        dueDate: "2026-07-01",
        estimatedHours: 5,
        title: "x",
      }),
    ).toEqual({
      task_status_id: 3,
      assignee_user_ids: [7, 8],
      reporter_user_id: 9,
      due_date: "2026-07-01",
      estimated_hours: 5,
      title: "x",
    });
  });

  it("drops undefined values", () => {
    expect(toSnake({ title: "x", description: undefined })).toEqual({ title: "x" });
  });

  it("keeps null values (explicit clear)", () => {
    expect(toSnake({ dueDate: null })).toEqual({ due_date: null });
  });
});
