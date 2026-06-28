"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders Markdown text (GitHub-flavored) with basic Tailwind typography. */
export function Markdown({ children }: { children: string }) {
  if (!children.trim()) {
    return <p className="text-sm text-gray-400">（説明はありません）</p>;
  }
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
