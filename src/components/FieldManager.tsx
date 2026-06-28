"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fieldApi } from "@/lib/api/endpoints";
import { Button, Card, Field, Input, Select } from "@/components/ui";

const TYPE_LABELS: Record<App.Enums.ProjectFieldType, string> = {
  datetime: "日時",
  text: "文字列",
  number: "数値",
  select: "単一選択",
  multiselect: "複数選択",
};

export function FieldManager({ projectId }: { projectId: number }) {
  const qc = useQueryClient();
  const fields = useQuery({ queryKey: ["project-fields", projectId], queryFn: () => fieldApi.list(projectId) });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["project-fields", projectId] });
    qc.invalidateQueries({ queryKey: ["project", projectId] });
  };

  const create = useMutation({
    mutationFn: (body: { name: string; type: App.Enums.ProjectFieldType; options?: string[] }) =>
      fieldApi.create(projectId, body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; is_hidden?: boolean; options?: string[] } }) =>
      fieldApi.update(projectId, id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: number) => fieldApi.remove(projectId, id), onSuccess: invalidate });
  const reorder = useMutation({ mutationFn: (ids: number[]) => fieldApi.reorder(projectId, ids), onSuccess: invalidate });

  const [name, setName] = useState("");
  const [type, setType] = useState<App.Enums.ProjectFieldType>("text");
  const [optionsText, setOptionsText] = useState("");

  const list = fields.data ?? [];
  const needsOptions = type === "select" || type === "multiselect";

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const options = optionsText.split(",").map((s) => s.trim()).filter(Boolean);
    create.mutate({ name, type, options: needsOptions ? options : undefined });
    setName("");
    setOptionsText("");
  }

  function move(index: number, dir: -1 | 1) {
    const ids = list.map((f) => f.id);
    const t = index + dir;
    if (t < 0 || t >= ids.length) return;
    [ids[index], ids[t]] = [ids[t], ids[index]];
    reorder.mutate(ids);
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">プロジェクト項目（カスタムフィールド）</h2>
      <p className="text-xs text-gray-500">「本番デプロイ日時」などの項目を追加できます。タスクで入力・表示されます。</p>
      <ul className="space-y-1">
        {list.map((f, i) => (
          <li key={f.id} className="flex items-center gap-2 border-b border-gray-100 py-1.5 text-sm">
            <input
              defaultValue={f.name}
              onBlur={(e) => {
                if (e.target.value && e.target.value !== f.name) update.mutate({ id: f.id, body: { name: e.target.value } });
              }}
              className="flex-1 rounded border border-transparent px-1 py-0.5 hover:border-gray-200"
            />
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">{TYPE_LABELS[f.type]}</span>
            {f.isHidden && <span className="text-[11px] text-gray-400">非表示</span>}
            <button onClick={() => move(i, -1)} className="px-1 text-gray-400 hover:text-gray-700" aria-label="上へ">↑</button>
            <button onClick={() => move(i, 1)} className="px-1 text-gray-400 hover:text-gray-700" aria-label="下へ">↓</button>
            <button onClick={() => update.mutate({ id: f.id, body: { is_hidden: !f.isHidden } })} className="px-1 text-xs text-gray-500 hover:underline">
              {f.isHidden ? "表示" : "非表示"}
            </button>
            <button
              onClick={() => { if (window.confirm("この項目と入力値を削除しますか？")) remove.mutate(f.id); }}
              className="px-1 text-xs text-red-600 hover:underline"
            >
              削除
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-gray-400">項目がありません</li>}
      </ul>

      <form className="space-y-2 border-t border-gray-100 pt-3" onSubmit={onCreate}>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-40 flex-1"><Field label="項目名"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field></div>
          <div className="w-32">
            <Field label="種類">
              <Select value={type} onChange={(e) => setType(e.target.value as App.Enums.ProjectFieldType)}>
                {(Object.keys(TYPE_LABELS) as App.Enums.ProjectFieldType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" disabled={create.isPending}>追加</Button>
        </div>
        {needsOptions && (
          <Field label="選択肢（カンマ区切り）">
            <Input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="dev, staging, prod" />
          </Field>
        )}
      </form>
    </Card>
  );
}
