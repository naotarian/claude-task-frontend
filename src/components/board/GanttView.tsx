"use client";

import { computeGanttRange, ganttBarStyle } from "@/lib/gantt";
import { formatDate } from "@/lib/format";

type Task = App.Data.TaskData;

export function GanttView({ tasks }: { tasks: Task[] }) {
  const range = computeGanttRange(tasks);

  if (!range) {
    return <p className="text-sm text-gray-400">日程が設定されたタスクがありません。</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        期間: {formatDate(range.start.toISOString())} 〜 {formatDate(range.end.toISOString())}
        （青=予定 / 緑=実績）
      </p>
      <div className="space-y-1">
        {tasks.map((task) => {
          const planned = ganttBarStyle(task.plannedStartDate, task.plannedEndDate, range);
          const actual = ganttBarStyle(task.actualStartDate, task.actualEndDate, range);
          return (
            <div key={task.id} className="flex items-center gap-2 text-xs">
              <div className="w-40 truncate text-gray-700" title={task.title}>
                {task.title}
              </div>
              <div className="relative h-6 flex-1 rounded bg-gray-100">
                {planned && (
                  <div className="absolute top-0.5 h-2 rounded bg-blue-400" style={planned} title="予定" />
                )}
                {actual && (
                  <div className="absolute bottom-0.5 h-2 rounded bg-green-500" style={actual} title="実績" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
