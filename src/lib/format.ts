// Pure formatting/label helpers shared across the UI. Kept free of React so
// they are easy to unit test.

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  // Accepts ISO date or datetime; render as YYYY/MM/DD.
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return "—";
  return `${Number(hours)}h`;
}

const PRIORITY_LABELS: Record<App.Enums.TaskPriority, string> = {
  low: "低",
  normal: "中",
  high: "高",
};

export function priorityLabel(priority: App.Enums.TaskPriority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "オーナー",
  admin: "管理者",
  member: "メンバー",
  viewer: "閲覧者",
};

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "—";
  return ROLE_LABELS[role] ?? role;
}

/** Percentage of the plan storage quota used (0-100), or null if unlimited. */
export function storageUsagePercent(usedBytes: number, maxBytes: number | null): number | null {
  if (maxBytes === null || maxBytes <= 0) return null;
  return Math.min(100, Math.round((usedBytes / maxBytes) * 100));
}
