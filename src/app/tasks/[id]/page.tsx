"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Protected } from "@/components/Protected";
import { useAddComment, useComments, useLogWork, useProject, useSaveTask, useTask, useWorkLogs } from "@/lib/hooks";
import { projectApi, taskApi } from "@/lib/api/endpoints";
import { Button, Card, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { CustomFields } from "@/components/CustomFields";
import { formatBytes, formatDate, formatHours } from "@/lib/format";

function TaskDetail({ taskId }: { taskId: number }) {
  const router = useRouter();
  const qc = useQueryClient();
  const task = useTask(taskId);
  const save = useSaveTask(taskId);

  const projectId = task.data?.projectId;
  const members = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => projectApi.members(projectId!),
    enabled: !!projectId,
  });
  const project = useProject(projectId ?? NaN);
  const fields = (project.data?.fields ?? []) as App.Data.ProjectFieldData[];
  const categories = (project.data?.categories ?? []) as App.Data.TaskCategoryData[];
  const categoriesEnabled = project.data?.categoriesEnabled ?? false;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(false);
  const [priority, setPriority] = useState<App.Enums.TaskPriority>("normal");
  const [progress, setProgress] = useState(0);
  const [dates, setDates] = useState<Record<string, string>>({
    dueDate: "",
    plannedStartDate: "",
    plannedEndDate: "",
    actualStartDate: "",
    actualEndDate: "",
  });
  const [estimatedHours, setEstimatedHours] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [customValues, setCustomValues] = useState<Record<number, unknown>>({});

  useEffect(() => {
    if (!task.data) return;
    const t = task.data;
    setTitle(t.title);
    setDescription(t.description ?? "");
    setPriority(t.priority);
    setProgress(t.progress);
    setEstimatedHours(t.estimatedHours?.toString() ?? "");
    setAssigneeIds(t.assignees.map((a) => a.id));
    setCategoryId(t.categoryId ?? "");
    setCustomValues(Object.fromEntries(t.customFields.map((c) => [c.fieldId, c.value])));
    setDates({
      dueDate: t.dueDate ?? "",
      plannedStartDate: t.plannedStartDate ?? "",
      plannedEndDate: t.plannedEndDate ?? "",
      actualStartDate: t.actualStartDate ?? "",
      actualEndDate: t.actualEndDate ?? "",
    });
  }, [task.data]);

  if (task.isLoading) return <p className="text-gray-400">読み込み中…</p>;
  if (!task.data) return <p className="text-red-600">タスクを表示できません。</p>;

  function onSave() {
    save.mutate({
      title,
      description: description || null,
      priority,
      progress,
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      assigneeUserIds: assigneeIds,
      dueDate: dates.dueDate || null,
      plannedStartDate: dates.plannedStartDate || null,
      plannedEndDate: dates.plannedEndDate || null,
      actualStartDate: dates.actualStartDate || null,
      actualEndDate: dates.actualEndDate || null,
      taskCategoryId: categoryId === "" ? null : Number(categoryId),
      customFields: customValues,
    });
  }

  function toggleAssignee(id: number) {
    setAssigneeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  const setDate = (k: string, v: string) => setDates((d) => ({ ...d, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href={`/projects/${task.data.projectId}`} className="text-sm text-blue-600 hover:underline">
        ← プロジェクトへ戻る
      </Link>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>起票者: {task.data.reporterName ?? "—"}</span>
        </div>
        <Field label="タイトル">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          )}
        </div>

        <Field label="担当者（複数選択可）">
          <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 p-2">
            {members.data?.map((m) => (
              <label key={m.userId} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={assigneeIds.includes(m.userId)} onChange={() => toggleAssignee(m.userId)} />
                {m.name}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="優先度">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as App.Enums.TaskPriority)}>
              <option value="low">低</option>
              <option value="normal">中</option>
              <option value="high">高</option>
            </Select>
          </Field>
          <Field label="進捗 (%)">
            <Input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
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

        <fieldset className="rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-xs font-medium text-gray-500">日程（予実）</legend>
          <div className="grid grid-cols-2 gap-3">
            <Field label="納期"><Input type="date" value={dates.dueDate} onChange={(e) => setDate("dueDate", e.target.value)} /></Field>
            <div />
            <Field label="予定開始"><Input type="date" value={dates.plannedStartDate} onChange={(e) => setDate("plannedStartDate", e.target.value)} /></Field>
            <Field label="予定終了"><Input type="date" value={dates.plannedEndDate} onChange={(e) => setDate("plannedEndDate", e.target.value)} /></Field>
            <Field label="実績開始"><Input type="date" value={dates.actualStartDate} onChange={(e) => setDate("actualStartDate", e.target.value)} /></Field>
            <Field label="実績終了"><Input type="date" value={dates.actualEndDate} onChange={(e) => setDate("actualEndDate", e.target.value)} /></Field>
          </div>
        </fieldset>

        <fieldset className="rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-xs font-medium text-gray-500">工数（予実）</legend>
          <div className="grid grid-cols-2 gap-3">
            <Field label="予定工数 (h)">
              <Input type="number" step="0.25" min="0" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
            </Field>
            <div className="flex items-end text-sm text-gray-600">実績工数: {formatHours(task.data.actualHours)}</div>
          </div>
        </fieldset>

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

        <Button onClick={onSave} disabled={save.isPending}>{save.isPending ? "保存中…" : "保存"}</Button>
      </Card>

      <AttachmentSection taskId={taskId} />
      <WorkLogSection taskId={taskId} />
      <CommentSection taskId={taskId} />

      <DangerZone
        taskId={taskId}
        projectId={task.data.projectId}
        onDeleted={() => {
          qc.invalidateQueries({ queryKey: ["tasks", task.data!.projectId] });
          router.replace(`/projects/${task.data!.projectId}`);
        }}
      />
    </div>
  );
}

function AttachmentSection({ taskId }: { taskId: number }) {
  const qc = useQueryClient();
  const attachments = useQuery({ queryKey: ["attachments", taskId], queryFn: () => taskApi.attachments(taskId) });
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFiles(list: File[]) {
    if (!list.length) return;
    setBusy(true);
    try {
      for (const f of list) await taskApi.uploadAttachment(taskId, f);
      qc.invalidateQueries({ queryKey: ["attachments", taskId] });
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    await uploadFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files ?? []));
  }

  const remove = useMutation({
    mutationFn: (id: number) => taskApi.removeAttachment(taskId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attachments", taskId] }),
  });

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">添付資料</h2>
      <ul className="space-y-1 text-sm">
        {attachments.data?.map((a) => (
          <li key={a.id} className="flex items-center justify-between border-b border-gray-100 py-1">
            <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {a.originalName}
            </a>
            <span className="flex items-center gap-2 text-xs text-gray-400">
              {formatBytes(a.sizeBytes)}
              <button onClick={() => remove.mutate(a.id)} className="text-red-600 hover:underline">削除</button>
            </span>
          </li>
        ))}
        {attachments.data?.length === 0 && <li className="text-gray-400">添付なし</li>}
      </ul>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-4 text-center text-sm transition ${
          dragOver ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-500"
        }`}
      >
        <span>{busy ? "アップロード中…" : "ファイルをドラッグ&ドロップ、またはクリックして選択"}</span>
        <span className="text-xs text-gray-400">画像・Excel など（ストレージ容量に加算されます）</span>
        <input type="file" multiple onChange={onUpload} disabled={busy} className="hidden" />
      </label>
    </Card>
  );
}

function WorkLogSection({ taskId }: { taskId: number }) {
  const logs = useWorkLogs(taskId);
  const logWork = useLogWork(taskId);
  const [workedOn, setWorkedOn] = useState("");
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!workedOn || !hours) return;
    logWork.mutate(
      { workedOn, hours: Number(hours), note: note || undefined },
      { onSuccess: () => { setHours(""); setNote(""); } },
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">工数記録</h2>
      <ul className="space-y-1 text-sm">
        {logs.data?.map((log) => (
          <li key={log.id} className="flex justify-between border-b border-gray-100 py-1">
            <span>{formatDate(log.workedOn)} ・ {log.userName} {log.note ? `（${log.note}）` : ""}</span>
            <span className="font-medium">{formatHours(log.hours)}</span>
          </li>
        ))}
        {logs.data?.length === 0 && <li className="text-gray-400">記録なし</li>}
      </ul>
      <form className="flex flex-wrap items-end gap-2" onSubmit={onAdd}>
        <div className="w-40"><Field label="日付"><Input type="date" value={workedOn} onChange={(e) => setWorkedOn(e.target.value)} required /></Field></div>
        <div className="w-24"><Field label="時間(h)"><Input type="number" step="0.25" min="0.25" value={hours} onChange={(e) => setHours(e.target.value)} required /></Field></div>
        <div className="min-w-40 flex-1"><Field label="メモ"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
        <Button type="submit" disabled={logWork.isPending}>記録</Button>
      </form>
    </Card>
  );
}

function CommentSection({ taskId }: { taskId: number }) {
  const comments = useComments(taskId);
  const addComment = useAddComment(taskId);
  const [body, setBody] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    addComment.mutate(body, { onSuccess: () => setBody("") });
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">コメント</h2>
      <ul className="space-y-2 text-sm">
        {comments.data?.map((c) => (
          <li key={c.id} className="rounded bg-gray-50 p-2">
            <div className="text-xs text-gray-500">{c.userName} ・ {formatDate(c.createdAt)}</div>
            <div className="whitespace-pre-wrap">{c.body}</div>
          </li>
        ))}
        {comments.data?.length === 0 && <li className="text-gray-400">コメントなし</li>}
      </ul>
      <form className="space-y-2" onSubmit={onAdd}>
        <Textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="コメントを書く…" />
        <Button type="submit" disabled={addComment.isPending}>投稿</Button>
      </form>
    </Card>
  );
}

function DangerZone({ taskId, onDeleted }: { taskId: number; projectId: number; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const attachments = useQuery({ queryKey: ["attachments", taskId], queryFn: () => taskApi.attachments(taskId) });
  const count = attachments.data?.length ?? 0;
  const del = useMutation({ mutationFn: () => taskApi.remove(taskId), onSuccess: onDeleted });

  return (
    <Card className="space-y-2 border-red-200">
      <h2 className="text-sm font-semibold text-red-700">タスクの削除</h2>
      {count > 0 && (
        <p className="text-xs text-red-600">⚠ このタスクには添付資料が {count} 件あります。削除すると添付資料も一緒に削除されます。</p>
      )}
      <Button variant="danger" onClick={() => setConfirming(true)}>このタスクを削除</Button>
      {confirming && (
        <Modal title="タスクを削除しますか？" onClose={() => setConfirming(false)}>
          <p className="text-sm text-gray-700">
            この操作は取り消せません。
            {count > 0 && ` 添付資料 ${count} 件も削除されます。`}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>キャンセル</Button>
            <Button variant="danger" onClick={() => del.mutate()} disabled={del.isPending}>削除する</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
}

export default function TaskPage() {
  const params = useParams<{ id: string }>();
  return (
    <Protected>
      <TaskDetail taskId={Number(params.id)} />
    </Protected>
  );
}
