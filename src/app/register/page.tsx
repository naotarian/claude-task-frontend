"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register.mutateAsync({ name, email, password, passwordConfirmation });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "登録に失敗しました");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">新規登録</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="お名前">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="メールアドレス">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="パスワード">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Field label="パスワード（確認）">
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "登録中…" : "登録する"}
          </Button>
        </form>
        <p className="text-sm text-gray-500">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </p>
      </Card>
    </main>
  );
}
