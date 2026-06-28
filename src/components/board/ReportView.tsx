"use client";

import { summarizeEffort } from "@/lib/gantt";
import { formatHours } from "@/lib/format";

type Task = App.Data.TaskData;

export function ReportView({ tasks }: { tasks: Task[] }) {
  const summary = summarizeEffort(tasks);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="予定工数 合計" value={formatHours(summary.estimatedTotal)} />
        <SummaryCard label="実績工数 合計" value={formatHours(summary.actualTotal)} />
        <SummaryCard
          label="差異 (実績-予定)"
          value={`${summary.variance >= 0 ? "+" : ""}${summary.variance}h`}
          highlight={summary.variance > 0}
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2">タスク</th>
            <th className="py-2 text-right">予定</th>
            <th className="py-2 text-right">実績</th>
            <th className="py-2 text-right">差異</th>
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((row) => {
            const variance = row.actual - (row.estimated ?? 0);
            return (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="py-2">{row.title}</td>
                <td className="py-2 text-right">{formatHours(row.estimated)}</td>
                <td className="py-2 text-right">{formatHours(row.actual)}</td>
                <td className={`py-2 text-right ${variance > 0 ? "text-red-600" : "text-gray-500"}`}>
                  {variance >= 0 ? "+" : ""}
                  {variance}h
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? "text-red-600" : "text-gray-800"}`}>{value}</div>
    </div>
  );
}
