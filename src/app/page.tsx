"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, isLoading, router]);

  return (
    <main className="flex flex-1 items-center justify-center">
      <p className="text-gray-500">読み込み中…</p>
    </main>
  );
}
