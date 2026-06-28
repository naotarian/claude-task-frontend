"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { useProject, useTasks } from "@/lib/hooks";
import { Board } from "@/components/board/Board";
import { GanttView } from "@/components/board/GanttView";
import { ReportView } from "@/components/board/ReportView";
import { CreateTaskModal } from "@/components/board/CreateTaskModal";
import { TaskFilterBar } from "@/components/board/TaskFilterBar";
import { filterTasks, type TaskFilter } from "@/lib/filter";
import { Button } from "@/components/ui";

type Tab = "board" | "gantt" | "report";

function ProjectView({ projectId }: { projectId: number }) {
  const project = useProject(projectId);
  const tasks = useTasks(projectId);
  const [tab, setTab] = useState<Tab>("board");
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>({});

  if (project.isLoading) return <p className="text-gray-400">読み込み中…</p>;
  if (project.isError || !project.data) return <p className="text-red-600">プロジェクトを表示できません。</p>;

  const statuses = (project.data.statuses ?? []) as App.Data.TaskStatusData[];
  const fields = (project.data.fields ?? []) as App.Data.ProjectFieldData[];
  const categories = (project.data.categories ?? []) as App.Data.TaskCategoryData[];
  const taskList = filterTasks(tasks.data ?? [], filter);

  const tabs: { key: Tab; label: string }[] = [
    { key: "board", label: "ボード" },
    { key: "gantt", label: "ガント" },
    { key: "report", label: "予実レポート" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← ダッシュボード
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            [{project.data.key}] {project.data.name}
            {project.data.status === "archived" && (
              <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">アーカイブ済み</span>
            )}
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/permissions" className="text-gray-500 hover:underline">権限について</Link>
            {project.data.role === "owner" && (
              <Link href={`/projects/${projectId}/settings`} className="text-blue-600 hover:underline">
                プロジェクト設定
              </Link>
            )}
          </div>
        </div>
      </div>

      {project.data.role !== "viewer" && (
        <div>
          <Button onClick={() => setShowCreate(true)}>＋ タスクを新規作成</Button>
        </div>
      )}
      {showCreate && (
        <CreateTaskModal
          projectId={projectId}
          statuses={statuses}
          fields={fields}
          categories={categories}
          categoriesEnabled={project.data.categoriesEnabled}
          onClose={() => setShowCreate(false)}
        />
      )}

      <TaskFilterBar
        projectId={projectId}
        categories={categories}
        categoriesEnabled={project.data.categoriesEnabled}
        filter={filter}
        onChange={setFilter}
      />

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.key ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tasks.isLoading ? (
        <p className="text-gray-400">タスクを読み込み中…</p>
      ) : tab === "board" ? (
        <Board projectId={projectId} statuses={statuses} tasks={taskList} />
      ) : tab === "gantt" ? (
        <GanttView tasks={taskList} />
      ) : (
        <ReportView tasks={taskList} />
      )}
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);

  return (
    <Protected>
      <ProjectView projectId={projectId} />
    </Protected>
  );
}
