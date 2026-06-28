"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useUpdateTask } from "@/lib/hooks";
import { visibleStatuses, groupTasksByStatus } from "@/lib/board";
import { priorityLabel, formatDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

type Status = App.Data.TaskStatusData;
type Task = App.Data.TaskData;

export function Board({
  projectId,
  statuses,
  tasks,
}: {
  projectId: number;
  statuses: Status[];
  tasks: Task[];
}) {
  const update = useUpdateTask(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columns = visibleStatuses(statuses);
  const grouped = groupTasksByStatus(tasks);

  function onDragStart(event: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === Number(event.active.id)) ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = Number(active.id);
    const newStatusId = Number(over.id);
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.taskStatusId !== newStatusId) {
      update.mutate({ id: taskId, data: { taskStatusId: newStatusId } });
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => (
          <Column key={status.id} status={status} tasks={grouped[status.id] ?? []} statuses={columns} projectId={projectId} />
        ))}
      </div>
      <DragOverlay>{activeTask ? <CardBody task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  tasks,
  statuses,
  projectId,
}: {
  status: Status;
  tasks: Task[];
  statuses: Status[];
  projectId: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  return (
    <div className="w-72 shrink-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
        <h3 className="text-sm font-semibold">{status.name}</h3>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-24 space-y-2 rounded-md p-1 transition ${isOver ? "bg-blue-50 ring-1 ring-blue-300" : ""}`}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} statuses={statuses} projectId={projectId} />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-200 p-3 text-center text-xs text-gray-300">
            ここにドロップ
          </p>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ task, statuses, projectId }: { task: Task; statuses: Status[]; projectId: number }) {
  const update = useUpdateTask(projectId);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}>
      <CardBody
        task={task}
        statuses={statuses}
        onStatusChange={(id) => update.mutate({ id: task.id, data: { taskStatusId: id } })}
      />
    </div>
  );
}

function CardBody({
  task,
  statuses,
  onStatusChange,
}: {
  task: Task;
  statuses?: Status[];
  onStatusChange?: (statusId: number) => void;
}) {
  // Stop pointer events on interactive controls from starting a card drag.
  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation();

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/tasks/${task.id}`}
            className="block truncate text-sm font-medium text-gray-800 hover:text-blue-600"
            onPointerDown={stop}
            onClick={stop}
          >
            {task.title}
          </Link>
        </div>
        {statuses && onStatusChange && (
          <select
            value={task.taskStatusId}
            onChange={(e) => onStatusChange(Number(e.target.value))}
            onPointerDown={stop}
            onClick={stop}
            className="w-20 shrink-0 rounded border border-gray-200 px-1 py-0.5 text-[11px] text-gray-600"
            aria-label="ステータス変更"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="rounded bg-gray-100 px-1.5 py-0.5">{priorityLabel(task.priority)}</span>
        {task.categoryName && (
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-600">{task.categoryName}</span>
        )}
        {task.dueDate && <span>納期 {formatDate(task.dueDate)}</span>}
        <span>{task.progress}%</span>
        <div className="ml-auto">
          {task.assignees.length > 0 ? (
            <span className="flex items-center -space-x-1.5">
              {task.assignees.slice(0, 3).map((a) => (
                <Avatar key={a.id} name={a.name} avatarPath={a.avatarPath} size={20} />
              ))}
              {task.assignees.length > 3 && (
                <span className="ml-1 text-[11px] text-gray-400">+{task.assignees.length - 3}</span>
              )}
            </span>
          ) : (
            <span className="text-gray-300">未割当</span>
          )}
        </div>
      </div>
    </div>
  );
}
