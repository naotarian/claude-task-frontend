"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// (Link used for project links and the settings link below)
import { organizationApi, projectApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { formatBytes, roleLabel } from "@/lib/format";
import { Button, Card, ErrorText, Field, Input } from "./ui";

export function OrganizationSection({ org }: { org: App.Data.OrganizationData }) {
  const qc = useQueryClient();

  const projects = useQuery({
    queryKey: ["projects", org.id],
    queryFn: () => projectApi.list(org.id),
  });

  const billing = useQuery({
    queryKey: ["billing", org.id],
    queryFn: () => organizationApi.billing(org.id),
  });

  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => projectApi.create(org.id, key, name),
    onSuccess: () => {
      setKey("");
      setName("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["projects", org.id] });
      qc.invalidateQueries({ queryKey: ["billing", org.id] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "作成に失敗しました"),
  });

  const plan = billing.data?.plan;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{org.name}</h2>
          <p className="text-xs text-gray-500">
            {org.type === "personal" ? "個人" : "組織"} ・ あなたの権限: {roleLabel(org.role)}
            {(org.role === "owner" || org.role === "admin") && (
              <>
                {" ・ "}
                <Link href={`/organizations/${org.id}/settings`} className="text-blue-600 hover:underline">
                  組織設定
                </Link>
              </>
            )}
          </p>
        </div>
        {plan && (
          <div className="text-right text-xs text-gray-500">
            <div className="font-medium text-gray-700">プラン: {plan.name}</div>
            <div>
              プロジェクト {billing.data?.projectCount}
              {plan.maxProjects !== null ? ` / ${plan.maxProjects}` : ""}
            </div>
            {plan.maxStorageBytesPerProject !== null && (
              <div>上限ストレージ/PJ: {formatBytes(plan.maxStorageBytesPerProject)}</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {projects.isLoading && <p className="text-sm text-gray-400">読み込み中…</p>}
        {projects.data?.length === 0 && <p className="text-sm text-gray-400">プロジェクトがありません</p>}
        <ul className="divide-y divide-gray-100">
          {projects.data?.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <div>
                <Link href={`/projects/${p.id}`} className="font-medium text-blue-600 hover:underline">
                  [{p.key}] {p.name}
                </Link>
                {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form
        className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div className="w-28">
          <Field label="キー">
            <Input value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} placeholder="PROJ" required />
          </Field>
        </div>
        <div className="flex-1 min-w-40">
          <Field label="プロジェクト名">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
        </div>
        <Button type="submit" disabled={create.isPending}>
          追加
        </Button>
      </form>
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}
