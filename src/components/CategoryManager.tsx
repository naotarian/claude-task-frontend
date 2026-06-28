"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, projectApi } from "@/lib/api/endpoints";
import { useProject } from "@/lib/hooks";
import { Button, Card, Field, Input } from "@/components/ui";

export function CategoryManager({ projectId }: { projectId: number }) {
  const qc = useQueryClient();
  const project = useProject(projectId);
  const categories = ((project.data?.categories ?? []) as App.Data.TaskCategoryData[])
    .slice()
    .sort((a, b) => a.position - b.position);
  const enabled = project.data?.categoriesEnabled ?? true;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["project", projectId] });
    qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const toggle = useMutation({
    mutationFn: (value: boolean) => projectApi.updateSettings(projectId, { categories_enabled: value }),
    onSuccess: invalidate,
  });
  const create = useMutation({ mutationFn: (name: string) => categoryApi.create(projectId, name), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoryApi.update(projectId, id, name),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: number) => categoryApi.remove(projectId, id), onSuccess: invalidate });
  const reorder = useMutation({ mutationFn: (ids: number[]) => categoryApi.reorder(projectId, ids), onSuccess: invalidate });

  const [name, setName] = useState("");

  function move(index: number, dir: -1 | 1) {
    const ids = categories.map((c) => c.id);
    const t = index + dir;
    if (t < 0 || t >= ids.length) return;
    [ids[index], ids[t]] = [ids[t], ids[index]];
    reorder.mutate(ids);
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">カテゴリ</h2>
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input type="checkbox" checked={enabled} onChange={(e) => toggle.mutate(e.target.checked)} />
          カテゴリ機能を使う
        </label>
      </div>
      <p className="text-xs text-gray-500">「設計」「実装」「テスト」などを自由に作成できます。未設定のタスクは「未割り当て」です。</p>

      {enabled && (
        <>
          <ul className="space-y-1">
            {categories.map((c, i) => (
              <li key={c.id} className="flex items-center gap-2 border-b border-gray-100 py-1.5 text-sm">
                <input
                  defaultValue={c.name}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== c.name) update.mutate({ id: c.id, name: e.target.value });
                  }}
                  className="flex-1 rounded border border-transparent px-1 py-0.5 hover:border-gray-200"
                />
                <button onClick={() => move(i, -1)} className="px-1 text-gray-400 hover:text-gray-700" aria-label="上へ">↑</button>
                <button onClick={() => move(i, 1)} className="px-1 text-gray-400 hover:text-gray-700" aria-label="下へ">↓</button>
                <button
                  onClick={() => { if (window.confirm("このカテゴリを削除しますか？（対象タスクは未割り当てになります）")) remove.mutate(c.id); }}
                  className="px-1 text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              </li>
            ))}
            {categories.length === 0 && <li className="text-sm text-gray-400">カテゴリがありません</li>}
          </ul>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) { create.mutate(name); setName(""); }
            }}
          >
            <div className="flex-1"><Field label="新しいカテゴリ"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field></div>
            <Button type="submit" disabled={create.isPending}>追加</Button>
          </form>
        </>
      )}
    </Card>
  );
}
