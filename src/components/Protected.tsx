"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";
import { authApi } from "@/lib/api/endpoints";
import { AppHeader } from "./AppHeader";
import { Button, Card } from "./ui";

/** Wraps authenticated pages: redirects to /login when not signed in,
 * and shows an email-verification gate until the address is verified. */
export function Protected({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">読み込み中…</p>
      </main>
    );
  }

  if (!user) return null;

  if (!user.emailVerified) {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <VerifyEmailGate email={user.email} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function VerifyEmailGate({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    try {
      await authApi.resendVerification();
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="w-full max-w-md space-y-4 text-center">
      <h1 className="text-lg font-semibold">メールアドレスの確認</h1>
      <p className="text-sm text-gray-600">
        <span className="font-medium">{email}</span> 宛に確認メールを送信しました。
        メール内のリンクをクリックすると利用を開始できます。
      </p>
      <Button onClick={resend} disabled={sending} className="w-full">
        {sending ? "送信中…" : "確認メールを再送する"}
      </Button>
      {sent && <p className="text-sm text-green-600">確認メールを再送しました。</p>}
      <p className="text-xs text-gray-400">
        開発環境では Mailhog (http://localhost:8025) でメールを確認できます。
      </p>
    </Card>
  );
}
