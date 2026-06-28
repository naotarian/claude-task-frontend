"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ログインに失敗しました");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">ログイン</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="メールアドレス">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="パスワード">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "ログイン中…" : "ログイン"}
          </Button>
        </form>
        <p className="text-sm text-gray-500">
          アカウントがない方は{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
      </Card>
    </main>
  );
}
