// Pure client-side task filtering (by the fields editable on a task).

type Task = App.Data.TaskData;

export type TaskFilter = {
  keyword?: string;
  assigneeUserId?: number | null;
  priority?: App.Enums.TaskPriority | null;
  categoryId?: number | null;
};

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  const keyword = filter.keyword?.trim().toLowerCase();

  return tasks.filter((task) => {
    if (keyword && !task.title.toLowerCase().includes(keyword)) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.categoryId != null && task.categoryId !== filter.categoryId) return false;
    if (filter.assigneeUserId != null && !task.assignees.some((a) => a.id === filter.assigneeUserId)) {
      return false;
    }
    return true;
  });
}

export function isFilterActive(filter: TaskFilter): boolean {
  return Boolean(filter.keyword?.trim() || filter.assigneeUserId || filter.priority || filter.categoryId);
}
