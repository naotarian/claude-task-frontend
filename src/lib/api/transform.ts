// camelCase task fields -> snake_case API payload keys.

const FIELD_MAP: Record<string, string> = {
  taskStatusId: "task_status_id",
  taskCategoryId: "task_category_id",
  assigneeUserIds: "assignee_user_ids",
  reporterUserId: "reporter_user_id",
  parentTaskId: "parent_task_id",
  dueDate: "due_date",
  plannedStartDate: "planned_start_date",
  plannedEndDate: "planned_end_date",
  actualStartDate: "actual_start_date",
  actualEndDate: "actual_end_date",
  estimatedHours: "estimated_hours",
  customFields: "custom_fields",
};

export function toSnake(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    out[FIELD_MAP[key] ?? key] = value;
  }
  return out;
}
