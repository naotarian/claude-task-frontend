// Pure helpers for the Gantt chart and the plan/actual report. No React.

type Task = App.Data.TaskData;

export type GanttRange = { start: Date; end: Date };

function parse(date: string | null): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Earliest start and latest end across all planned/actual dates. */
export function computeGanttRange(tasks: Task[]): GanttRange | null {
  const dates: Date[] = [];
  for (const t of tasks) {
    for (const d of [t.plannedStartDate, t.plannedEndDate, t.actualStartDate, t.actualEndDate]) {
      const parsed = parse(d);
      if (parsed) dates.push(parsed);
    }
  }
  if (dates.length === 0) return null;

  const start = new Date(Math.min(...dates.map((d) => d.getTime())));
  const end = new Date(Math.max(...dates.map((d) => d.getTime())));
  return { start, end };
}

/** CSS left/width percentages for a bar within the range, or null. */
export function ganttBarStyle(
  start: string | null,
  end: string | null,
  range: GanttRange,
): { left: string; width: string } | null {
  const s = parse(start);
  const e = parse(end) ?? s;
  if (!s || !e) return null;

  const total = range.end.getTime() - range.start.getTime() || 1;
  const offset = s.getTime() - range.start.getTime();
  const span = Math.max(e.getTime() - s.getTime(), total * 0.01);

  const left = Math.max(0, (offset / total) * 100);
  const width = Math.min(100 - left, (span / total) * 100);
  return { left: `${left}%`, width: `${width}%` };
}

export type EffortSummary = {
  estimatedTotal: number;
  actualTotal: number;
  variance: number; // actual - estimated
  rows: { id: number; title: string; estimated: number | null; actual: number }[];
};

/** Aggregate planned vs actual hours across tasks. */
export function summarizeEffort(tasks: Task[]): EffortSummary {
  let estimatedTotal = 0;
  let actualTotal = 0;
  const rows = tasks.map((t) => {
    estimatedTotal += t.estimatedHours ?? 0;
    actualTotal += t.actualHours ?? 0;
    return { id: t.id, title: t.title, estimated: t.estimatedHours, actual: t.actualHours };
  });
  return {
    estimatedTotal,
    actualTotal,
    variance: actualTotal - estimatedTotal,
    rows,
  };
}
