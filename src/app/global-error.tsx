"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{ padding: 24, fontFamily: "sans-serif" }}>
          <h2>エラーが発生しました</h2>
          <button onClick={() => reset()}>再試行</button>
        </div>
      </body>
    </html>
  );
}
