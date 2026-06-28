"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { Button, Card } from "@/components/ui";

type State = "loading" | "success" | "unauthenticated" | "error";

function VerifyEmailInner() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useSearchParams();
  const target = params.get("target");
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!target) {
      setState("error");
      setMessage("リンクが不正です。");
      return;
    }

    authApi
      .verifyEmail(target)
      .then(() => {
        setState("success");
        qc.invalidateQueries({ queryKey: ["auth", "user"] });
        setTimeout(() => router.replace("/dashboard"), 1200);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          setState("unauthenticated");
        } else if (e instanceof ApiError && (e.status === 403 || e.status === 400)) {
          setState("error");
          setMessage("リンクの有効期限が切れているか、無効です。確認メールを再送してください。");
        } else {
          setState("error");
          setMessage("確認に失敗しました。時間をおいて再度お試しください。");
        }
      });
  }, [target, router, qc]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-lg font-semibold">メールアドレスの確認</h1>
        {state === "loading" && <p className="text-sm text-gray-500">確認しています…</p>}
        {state === "success" && (
          <p className="text-sm text-green-600">確認が完了しました。ダッシュボードへ移動します…</p>
        )}
        {state === "unauthenticated" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              この確認リンクはログインした状態で開く必要があります。ログイン後、もう一度メールのリンクを開いてください。
            </p>
            <Link href="/login">
              <Button className="w-full">ログインする</Button>
            </Link>
          </div>
        )}
        {state === "error" && <p className="text-sm text-red-600">{message}</p>}
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center p-6">読み込み中…</main>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
