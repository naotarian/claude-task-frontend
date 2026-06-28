"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/lib/auth";
import { Button } from "./ui";

export function AppHeader() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  async function onLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <Link href="/dashboard" className="text-base font-semibold">
        Backlog 風タスク管理
      </Link>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {user && <span>{user.name}</span>}
        <Button variant="ghost" onClick={onLogout}>
          ログアウト
        </Button>
      </div>
    </header>
  );
}
