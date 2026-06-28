"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { statusApi } from "@/lib/api/endpoints";
import { useProject, useTasks } from "@/lib/hooks";
import { taskCountForStatus } from "@/lib/board";
import { Button, Card, Field, Input } from "@/components/ui";

export function StatusManager({ projectId }: { projectId: number }) {
  const qc = useQueryClient();
  const project = useProject(projectId);
  const tasks = useTasks(projectId);
  const statuses = ((project.data?.statuses ?? []) as App.Data.TaskStatusData[])
    .slice()
    .sort((a, b) => a.position - b.position);
  const taskList = tasks.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["project", projectId] });
    qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const create = useMutation({ mutationFn: (name: string) => statusApi.create(projectId, { name }), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; color?: string; is_hidden?: boolean } }) =>
      statusApi.update(projectId, id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: number) => statusApi.remove(projectId, id), onSuccess: invalidate });
  const reorder = useMutation({ mutationFn: (ids: number[]) => statusApi.reorder(projectId, ids), onSuccess: invalidate });

  const [newName, setNewName] = useState("");

  function move(index: number, dir: -1 | 1) {
    const ids = statuses.map((s) => s.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  }

  function confirmHide(s: App.Data.TaskStatusData) {
    const count = taskCountForStatus(taskList, s.id);
    if (!s.isHidden && count > 0) {
      if (!window.confirm(`このステータスには ${count} 件のタスクがあります。非表示にしますか？（タスクはボードに表示されなくなります）`)) return;
    }
    update.mutate({ id: s.id, body: { is_hidden: !s.isHidden } });
  }

  function confirmDelete(s: App.Data.TaskStatusData) {
    const count = taskCountForStatus(taskList, s.id);
    const msg =
      count > 0
        ? `このステータスには ${count} 件のタスクがあります。削除すると「未割当」に移動します。削除しますか？`
        : "このステータスを削除しますか？";
    if (window.confirm(msg)) remove.mutate(s.id);
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">ステータス</h2>
      <p className="text-xs text-gray-500">並び順・表示/非表示・追加・削除ができます。「未割当」は削除できません。</p>
      <ul className="space-y-1">
        {statuses.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 border-b border-gray-100 py-1.5 text-sm">
            <input
              type="color"
              value={s.color}
              disabled={s.isProtected}
              onChange={(e) => update.mutate({ id: s.id, body: { color: e.target.value } })}
              className="h-6 w-6 rounded border-0 bg-transparent p-0"
            />
            <input
              defaultValue={s.name}
              disabled={s.isProtected}
              onBlur={(e) => {
                if (e.target.value && e.target.value !== s.name) update.mutate({ id: s.id, body: { name: e.target.value } });
              }}
              className="flex-1 rounded border border-transparent px-1 py-0.5 hover:border-gray-200 disabled:text-gray-400"
            />
            {s.isHidden && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">非表示</span>}
            <button onClick={() => move(i, -1)} className="px-1 text-gray-400 hover:text-gray-700" aria-label="上へ">↑</button>
            <button onClick={() => move(i, 1)} className="px-1 text-gray-400 hover:text-gray-700" aria-label="下へ">↓</button>
            {!s.isProtected && (
              <>
                <button onClick={() => confirmHide(s)} className="px-1 text-xs text-gray-500 hover:underline">
                  {s.isHidden ? "表示" : "非表示"}
                </button>
                <button onClick={() => confirmDelete(s)} className="px-1 text-xs text-red-600 hover:underline">削除</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (newName.trim()) {
            create.mutate(newName);
            setNewName("");
          }
        }}
      >
        <div className="flex-1">
          <Field label="新しいステータス"><Input value={newName} onChange={(e) => setNewName(e.target.value)} /></Field>
        </div>
        <Button type="submit" disabled={create.isPending}>追加</Button>
      </form>
    </Card>
  );
}
