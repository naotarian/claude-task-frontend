"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi, taskApi, type TaskInput } from "./api/endpoints";

export function useProject(projectId: number) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectApi.get(projectId),
    enabled: Number.isFinite(projectId),
  });
}

export function useTasks(projectId: number) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.list(projectId),
    enabled: Number.isFinite(projectId),
  });
}

export function useCreateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput & { title: string }) => taskApi.create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useUpdateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskInput }) => taskApi.update(id, data),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["task", task.id] });
    },
  });
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskApi.get(taskId),
    enabled: Number.isFinite(taskId),
  });
}

export function useSaveTask(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput) => taskApi.update(taskId, data),
    onSuccess: (task) => {
      qc.setQueryData(["task", taskId], task);
      qc.invalidateQueries({ queryKey: ["tasks", task.projectId] });
    },
  });
}

export function useComments(taskId: number) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => taskApi.comments(taskId),
    enabled: Number.isFinite(taskId),
  });
}

export function useAddComment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => taskApi.addComment(taskId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });
}

export function useWorkLogs(taskId: number) {
  return useQuery({
    queryKey: ["work-logs", taskId],
    queryFn: () => taskApi.workLogs(taskId),
    enabled: Number.isFinite(taskId),
  });
}

export function useLogWork(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { workedOn: string; hours: number; note?: string }) =>
      taskApi.logWork(taskId, input.workedOn, input.hours, input.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-logs", taskId] });
      qc.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}
