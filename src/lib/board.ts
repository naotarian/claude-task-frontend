// Pure helpers for the board view.

type Status = App.Data.TaskStatusData;
type Task = App.Data.TaskData;

/** Visible (non-hidden) statuses, ordered by position. */
export function visibleStatuses(statuses: Status[]): Status[] {
  return statuses.filter((s) => !s.isHidden).slice().sort((a, b) => a.position - b.position);
}

/** Group tasks by their status id. */
export function groupTasksByStatus(tasks: Task[]): Record<number, Task[]> {
  const groups: Record<number, Task[]> = {};
  for (const task of tasks) {
    (groups[task.taskStatusId] ??= []).push(task);
  }
  return groups;
}

/** Count tasks currently in a given status. */
export function taskCountForStatus(tasks: Task[], statusId: number): number {
  return tasks.filter((t) => t.taskStatusId === statusId).length;
}
