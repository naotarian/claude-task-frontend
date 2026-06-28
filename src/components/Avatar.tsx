"use client";

import { initials, avatarColor } from "@/lib/avatar";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function Avatar({
  name,
  avatarPath,
  size = 24,
}: {
  name: string;
  avatarPath?: string | null;
  size?: number;
}) {
  const dimension = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (avatarPath) {
    const src = avatarPath.startsWith("http") ? avatarPath : `${API}/storage/${avatarPath}`;
    return (
      <img
        src={src}
        alt={name}
        title={name}
        className="inline-block rounded-full object-cover ring-2 ring-white"
        style={dimension}
      />
    );
  }

  return (
    <span
      title={name}
      className="inline-flex items-center justify-center rounded-full font-medium text-white ring-2 ring-white"
      style={{ ...dimension, backgroundColor: avatarColor(name) }}
    >
      {initials(name)}
    </span>
  );
}
