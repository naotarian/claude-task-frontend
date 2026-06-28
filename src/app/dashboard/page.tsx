"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/lib/api/endpoints";
import { Protected } from "@/components/Protected";
import { OrganizationSection } from "@/components/OrganizationSection";
import { Button, Card, Field, Input } from "@/components/ui";

function Dashboard() {
  const qc = useQueryClient();
  const orgs = useQuery({ queryKey: ["organizations"], queryFn: organizationApi.list });
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: () => organizationApi.create(name),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
      </div>

      {orgs.isLoading && <p className="text-gray-400">読み込み中…</p>}

      <div className="space-y-4">
        {orgs.data?.map((org) => (
          <OrganizationSection key={org.id} org={org} />
        ))}
      </div>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">新しい組織を作成</h2>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="flex-1">
            <Field label="組織名">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
          </div>
          <Button type="submit" disabled={create.isPending}>
            作成
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Protected>
      <Dashboard />
    </Protected>
  );
}
