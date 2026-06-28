"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Protected } from "@/components/Protected";
import { projectApi } from "@/lib/api/endpoints";
import { useProject } from "@/lib/hooks";
import { roleLabel } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { StatusManager } from "@/components/StatusManager";
import { CategoryManager } from "@/components/CategoryManager";
import { FieldManager } from "@/components/FieldManager";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";

function ProjectSettings({ projectId }: { projectId: number }) {
  const qc = useQueryClient();
  const project = useProject(projectId);
  const members = useQuery({ queryKey: ["project-members", projectId], queryFn: () => projectApi.members(projectId) });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<App.Enums.ProjectRole>("editor");
  const [error, setError] = useState<string | null>(null);

  const addMember = useMutation({
    mutationFn: () => projectApi.addMember(projectId, email, role),
    onSuccess: () => {
      setEmail("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["project-members", projectId] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "追加に失敗しました"),
  });

  const updateMember = useMutation({
    mutationFn: ({ id, r }: { id: number; r: App.Enums.ProjectRole }) => projectApi.updateMember(projectId, id, r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-members", projectId] }),
    onError: (e) => setError(e instanceof ApiError ? e.message : "変更に失敗しました"),
  });

  const archive = useMutation({
    mutationFn: () => (project.data?.status === "archived" ? projectApi.unarchive(projectId) : projectApi.archive(projectId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId] }),
  });

  if (!project.data) return <p className="text-gray-400">読み込み中…</p>;
  const isArchived = project.data.status === "archived";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/projects/${projectId}`} className="text-sm text-blue-600 hover:underline">← プロジェクトへ</Link>
        <h1 className="mt-1 text-xl font-semibold">[{project.data.key}] プロジェクト設定</h1>
        <Link href="/permissions" className="text-xs text-blue-600 hover:underline">権限について</Link>
      </div>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">メンバー</h2>
        <table className="w-full text-sm">
          <tbody>
            {members.data?.map((m) => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="py-2">
                  <div>{m.name}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                </td>
                <td className="py-2 text-right">
                  <Select
                    value={m.role}
                    onChange={(e) => updateMember.mutate({ id: m.id, r: e.target.value as App.Enums.ProjectRole })}
                    className="w-28"
                  >
                    {(["owner", "editor", "viewer"] as const).map((r) => (
                      <option key={r} value={r}>{roleLabel(r)}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form
          className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            addMember.mutate();
          }}
        >
          <div className="min-w-48 flex-1">
            <Field label="招待メールアドレス"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          </div>
          <div className="w-28">
            <Field label="権限">
              <Select value={role} onChange={(e) => setRole(e.target.value as App.Enums.ProjectRole)}>
                <option value="owner">オーナー</option>
                <option value="editor">編集者</option>
                <option value="viewer">閲覧者</option>
              </Select>
            </Field>
          </div>
          <Button type="submit" disabled={addMember.isPending}>追加</Button>
        </form>
        <ErrorText>{error}</ErrorText>
      </Card>

      <StatusManager projectId={projectId} />

      <CategoryManager projectId={projectId} />

      <FieldManager projectId={projectId} />

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">プロジェクトの状態</h2>
        <p className="text-xs text-gray-500">
          {isArchived ? "このプロジェクトはアーカイブ済みです。" : "終了したプロジェクトはアーカイブできます。"}
        </p>
        <Button variant={isArchived ? "primary" : "danger"} onClick={() => archive.mutate()} disabled={archive.isPending}>
          {isArchived ? "アーカイブ解除" : "アーカイブする"}
        </Button>
      </Card>
    </div>
  );
}

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>();
  return (
    <Protected>
      <ProjectSettings projectId={Number(params.id)} />
    </Protected>
  );
}
