"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "@/lib/api/endpoints";
import { isFilterActive, type TaskFilter } from "@/lib/filter";

export function TaskFilterBar({
  projectId,
  categories,
  categoriesEnabled,
  filter,
  onChange,
}: {
  projectId: number;
  categories: App.Data.TaskCategoryData[];
  categoriesEnabled: boolean;
  filter: TaskFilter;
  onChange: (f: TaskFilter) => void;
}) {
  const members = useQuery({ queryKey: ["project-members", projectId], queryFn: () => projectApi.members(projectId) });
  const set = (patch: Partial<TaskFilter>) => onChange({ ...filter, ...patch });
  const active = isFilterActive(filter);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <FilterIcon />
        絞り込み
      </span>

      {/* keyword search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          value={filter.keyword ?? ""}
          onChange={(e) => set({ keyword: e.target.value })}
          placeholder="タイトルで検索"
          className="h-8 w-48 rounded-full border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <FilterSelect
        value={filter.assigneeUserId ?? ""}
        active={filter.assigneeUserId != null}
        onChange={(v) => set({ assigneeUserId: v === "" ? null : Number(v) })}
      >
        <option value="">担当者</option>
        {members.data?.map((m) => (
          <option key={m.userId} value={m.userId}>{m.name}</option>
        ))}
      </FilterSelect>

      <FilterSelect
        value={filter.priority ?? ""}
        active={filter.priority != null}
        onChange={(v) => set({ priority: v === "" ? null : (v as App.Enums.TaskPriority) })}
      >
        <option value="">優先度</option>
        <option value="high">高</option>
        <option value="normal">中</option>
        <option value="low">低</option>
      </FilterSelect>

      {categoriesEnabled && (
        <FilterSelect
          value={filter.categoryId ?? ""}
          active={filter.categoryId != null}
          onChange={(v) => set({ categoryId: v === "" ? null : Number(v) })}
        >
          <option value="">カテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </FilterSelect>
      )}

      {active && (
        <button
          onClick={() => onChange({})}
          className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <CloseIcon />
          クリア
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  active,
  onChange,
  children,
}: {
  value: string | number;
  active: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 appearance-none rounded-full border bg-gray-50 pl-3 pr-7 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          active
            ? "border-blue-300 bg-blue-50 font-medium text-blue-700"
            : "border-gray-200 text-gray-600 hover:bg-gray-100"
        }`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
        <ChevronIcon />
      </span>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
