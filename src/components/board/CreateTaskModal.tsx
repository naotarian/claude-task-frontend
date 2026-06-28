"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectApi, taskApi } from "@/lib/api/endpoints";
import { useCreateTask } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import { Markdown } from "@/components/Markdown";
import { CustomFields } from "@/components/CustomFields";
import { Button, ErrorText, Field, Input, Modal, Select, Textarea } from "@/components/ui";

type Status = App.Data.TaskStatusData;
type ProjectField = App.Data.ProjectFieldData;

export function CreateTaskModal({
  projectId,
  statuses,
  fields = [],
  categories = [],
  categoriesEnabled = false,
  onClose,
}: {
  projectId: number;
  statuses: Status[];
  fields?: ProjectField[];
  categories?: App.Data.TaskCategoryData[];
  categoriesEnabled?: boolean;
  onClose: () => void;
}) {
  const { data: me } = useCurrentUser();
  const members = useQuery({ queryKey: ["project-members", projectId], queryFn: () => projectApi.members(projectId) });
  const create = useCreateTask(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(false);
  const [statusId, setStatusId] = useState<number | "">("");
  const [priority, setPriority] = useState<App.Enums.TaskPriority>("normal");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [reporterId, setReporterId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [customValues, setCustomValues] = useState<Record<number, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleAssignee(id: number) {
    setAssigneeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const task = await create.mutateAsync({
        title,
        description: description || null,
        taskStatusId: statusId === "" ? undefined : Number(statusId),
        priority,
        taskCategoryId: categoryId === "" ? null : Number(categoryId),
        assigneeUserIds: assigneeIds,
        reporterUserId: reporterId === "" ? (me?.id ?? null) : Number(reporterId),
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        customFields: Object.keys(customValues).length ? customValues : undefined,
      });
      // Upload attachments sequentially (each counts toward the storage quota).
      for (const file of files) {
        await taskApi.uploadAttachment(task.id, file);
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "作成に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="タスクの新規作成" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="タイトル">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">詳細（Markdown）</span>
            <button type="button" onClick={() => setPreview((p) => !p)} className="text-xs text-blue-600 hover:underline">
              {preview ? "編集" : "プレビュー"}
            </button>
          </div>
          {preview ? (
            <div className="rounded-md border border-gray-200 p-3">
              <Markdown>{description}</Markdown>
            </div>
          ) : (
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="# 見出し、- リスト、**強調** などが使えます" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="ステータス">
            <Select value={statusId} onChange={(e) => setStatusId(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">(既定)</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="優先度">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as App.Enums.TaskPriority)}>
              <option value="low">低</option>
              <option value="normal">中</option>
              <option value="high">高</option>
            </Select>
          </Field>
          <Field label="起票者">
            <Select value={reporterId} onChange={(e) => setReporterId(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">{me ? `${me.name}（自分）` : "自分"}</option>
              {members.data?.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </Select>
          </Field>
        </div>

        {categoriesEnabled && (
          <Field label="カテゴリ">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">未割り当て</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="担当者（複数選択可）">
          <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 p-2">
            {members.data?.length ? (
              members.data.map((m) => (
                <label key={m.userId} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={assigneeIds.includes(m.userId)} onChange={() => toggleAssignee(m.userId)} />
                  {m.name}
                </label>
              ))
            ) : (
              <span className="text-xs text-gray-400">プロジェクトメンバーがいません</span>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="納期"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
          <Field label="予定工数(h)"><Input type="number" step="0.25" min="0" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} /></Field>
        </div>

        {fields.length > 0 && (
          <fieldset className="rounded-md border border-gray-200 p-3">
            <legend className="px-1 text-xs font-medium text-gray-500">プロジェクト項目</legend>
            <CustomFields
              fields={fields}
              values={customValues}
              onChange={(id, v) => setCustomValues((prev) => ({ ...prev, [id]: v }))}
            />
          </fieldset>
        )}

        <Field label="添付ファイル（画像・Excel など。ストレージ容量に加算されます）">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files ?? [])]);
            }}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 border-dashed p-4 text-center text-sm transition ${
              dragOver ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-500"
            }`}
          >
            <span>ファイルをドラッグ&ドロップ、またはクリックして選択</span>
            {files.length > 0 && <span className="text-xs text-gray-500">{files.length} 件選択中</span>}
            <input
              type="file"
              multiple
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
              className="hidden"
            />
          </label>
        </Field>

        <ErrorText>{error}</ErrorText>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>キャンセル</Button>
          <Button type="submit" disabled={busy}>{busy ? "作成中…" : "作成"}</Button>
        </div>
      </form>
    </Modal>
  );
}
