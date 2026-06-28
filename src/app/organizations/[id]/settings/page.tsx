"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Protected } from "@/components/Protected";
import { organizationApi } from "@/lib/api/endpoints";
import { roleLabel } from "@/lib/format";
import { Button, Card, Field, Input, Select } from "@/components/ui";

function OrgSettings({ orgId }: { orgId: number }) {
  const qc = useQueryClient();
  const members = useQuery({ queryKey: ["members", orgId], queryFn: () => organizationApi.members(orgId) });
  const positions = useQuery({ queryKey: ["positions", orgId], queryFn: () => organizationApi.positions(orgId) });

  const updateMember = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: { role?: App.Enums.OrganizationRole; position_id?: number | null } }) =>
      organizationApi.updateMember(orgId, id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", orgId] }),
  });

  const [posName, setPosName] = useState("");
  const createPosition = useMutation({
    mutationFn: () => organizationApi.createPosition(orgId, posName),
    onSuccess: () => {
      setPosName("");
      qc.invalidateQueries({ queryKey: ["positions", orgId] });
    },
  });
  const deletePosition = useMutation({
    mutationFn: (id: number) => organizationApi.deletePosition(orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions", orgId] });
      qc.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← ダッシュボード</Link>
        <h1 className="mt-1 text-xl font-semibold">組織設定</h1>
      </div>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">メンバー</h2>
        <p className="text-xs text-gray-500">権限(owner/admin/member)と役職を設定できます。オーナーは複数設定できます。</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="py-2">名前</th>
              <th className="py-2">権限</th>
              <th className="py-2">役職</th>
            </tr>
          </thead>
          <tbody>
            {members.data?.map((m) => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="py-2">
                  <div>{m.name}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                </td>
                <td className="py-2">
                  <Select
                    value={m.role}
                    onChange={(e) =>
                      updateMember.mutate({ id: m.id, changes: { role: e.target.value as App.Enums.OrganizationRole } })
                    }
                    className="w-28"
                  >
                    {(["owner", "admin", "member"] as const).map((r) => (
                      <option key={r} value={r}>{roleLabel(r)}</option>
                    ))}
                  </Select>
                </td>
                <td className="py-2">
                  <Select
                    value={m.positionId ?? ""}
                    onChange={(e) =>
                      updateMember.mutate({
                        id: m.id,
                        changes: { position_id: e.target.value === "" ? null : Number(e.target.value) },
                      })
                    }
                    className="w-40"
                  >
                    <option value="">（なし）</option>
                    {positions.data?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">役職（肩書き）</h2>
        <p className="text-xs text-gray-500">「社長」「システム開発部部長」などの肩書きを作成できます（表示用）。</p>
        <ul className="space-y-1">
          {positions.data?.map((p) => (
            <li key={p.id} className="flex items-center justify-between border-b border-gray-100 py-1 text-sm">
              <span>{p.name}</span>
              <Button variant="danger" onClick={() => deletePosition.mutate(p.id)}>削除</Button>
            </li>
          ))}
          {positions.data?.length === 0 && <li className="text-sm text-gray-400">役職がありません</li>}
        </ul>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createPosition.mutate();
          }}
        >
          <div className="flex-1">
            <Field label="役職名"><Input value={posName} onChange={(e) => setPosName(e.target.value)} required /></Field>
          </div>
          <Button type="submit" disabled={createPosition.isPending}>追加</Button>
        </form>
      </Card>
    </div>
  );
}

export default function OrgSettingsPage() {
  const params = useParams<{ id: string }>();
  return (
    <Protected>
      <OrgSettings orgId={Number(params.id)} />
    </Protected>
  );
}
