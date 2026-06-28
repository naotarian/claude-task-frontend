import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Backlog 風 タスク管理",
  description: "プロジェクト単位のタスク管理 SaaS",
};

// This app is an authenticated SPA-style client; nothing benefits from static
// prerendering, so render dynamically and avoid build-time prerender of the
// fully client-side pages.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
