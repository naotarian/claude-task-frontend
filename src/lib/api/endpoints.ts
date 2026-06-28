// Typed API functions. Return types come from the auto-generated
// `App.Data.*` namespace (single source of truth shared with the backend).

import { apiFetch } from "./client";
import { toSnake } from "./transform";

type User = App.Data.UserData;
type Organization = App.Data.OrganizationData;
type Project = App.Data.ProjectData;
type Task = App.Data.TaskData;

export const authApi = {
  me: () => apiFetch<User>("/api/user"),
  login: (email: string, password: string) =>
    apiFetch<User>("/api/login", { method: "POST", body: { email, password } }),
  register: (name: string, email: string, password: string, passwordConfirmation: string) =>
    apiFetch<User>("/api/register", {
      method: "POST",
      body: { name, email, password, password_confirmation: passwordConfirmation },
    }),
  logout: () => apiFetch<{ message: string }>("/api/logout", { method: "POST" }),
  resendVerification: () =>
    apiFetch<{ message: string }>("/api/email/verification-notification", { method: "POST" }),
  // `target` is the full signed backend URL from the email; we forward its
  // path+query to the API as an authenticated request.
  verifyEmail: (target: string) => {
    const url = new URL(target);
    return apiFetch<{ message: string }>(`${url.pathname}${url.search}`);
  },
};

export const organizationApi = {
  list: () => apiFetch<Organization[]>("/api/organizations"),
  create: (name: string) =>
    apiFetch<Organization>("/api/organizations", { method: "POST", body: { name } }),
  members: (orgId: number) =>
    apiFetch<App.Data.OrganizationMemberData[]>(`/api/organizations/${orgId}/members`),
  updateMember: (
    orgId: number,
    memberId: number,
    changes: { role?: App.Enums.OrganizationRole; position_id?: number | null },
  ) =>
    apiFetch<App.Data.OrganizationMemberData>(`/api/organizations/${orgId}/members/${memberId}`, {
      method: "PATCH",
      body: changes,
    }),
  invite: (orgId: number, email: string, role: App.Enums.OrganizationRole) =>
    apiFetch<App.Data.OrganizationInvitationData>(`/api/organizations/${orgId}/invitations`, {
      method: "POST",
      body: { email, role },
    }),
  positions: (orgId: number) =>
    apiFetch<App.Data.OrganizationPositionData[]>(`/api/organizations/${orgId}/positions`),
  createPosition: (orgId: number, name: string) =>
    apiFetch<App.Data.OrganizationPositionData>(`/api/organizations/${orgId}/positions`, {
      method: "POST",
      body: { name },
    }),
  deletePosition: (orgId: number, positionId: number) =>
    apiFetch<void>(`/api/organizations/${orgId}/positions/${positionId}`, { method: "DELETE" }),
  billing: (orgId: number) =>
    apiFetch<App.Data.BillingSummaryData>(`/api/organizations/${orgId}/billing`),
};

export const projectApi = {
  list: (orgId: number) =>
    apiFetch<Project[]>(`/api/organizations/${orgId}/projects`),
  create: (orgId: number, key: string, name: string, description?: string) =>
    apiFetch<Project>(`/api/organizations/${orgId}/projects`, {
      method: "POST",
      body: { key, name, description },
    }),
  get: (projectId: number) => apiFetch<Project>(`/api/projects/${projectId}`),
  members: (projectId: number) =>
    apiFetch<App.Data.ProjectMemberData[]>(`/api/projects/${projectId}/members`),
  addMember: (projectId: number, email: string, role: App.Enums.ProjectRole) =>
    apiFetch<App.Data.ProjectMemberData>(`/api/projects/${projectId}/members`, {
      method: "POST",
      body: { email, role },
    }),
  updateMember: (projectId: number, memberId: number, role: App.Enums.ProjectRole) =>
    apiFetch<App.Data.ProjectMemberData>(`/api/projects/${projectId}/members/${memberId}`, {
      method: "PATCH",
      body: { role },
    }),
  archive: (projectId: number) =>
    apiFetch<App.Data.ProjectData>(`/api/projects/${projectId}/archive`, { method: "POST" }),
  unarchive: (projectId: number) =>
    apiFetch<App.Data.ProjectData>(`/api/projects/${projectId}/unarchive`, { method: "POST" }),
  updateSettings: (projectId: number, settings: { categories_enabled?: boolean }) =>
    apiFetch<App.Data.ProjectData>(`/api/projects/${projectId}/settings`, { method: "PATCH", body: settings }),
};

export const categoryApi = {
  create: (projectId: number, name: string) =>
    apiFetch<App.Data.TaskCategoryData>(`/api/projects/${projectId}/categories`, { method: "POST", body: { name } }),
  update: (projectId: number, categoryId: number, name: string) =>
    apiFetch<App.Data.TaskCategoryData>(`/api/projects/${projectId}/categories/${categoryId}`, {
      method: "PATCH",
      body: { name },
    }),
  remove: (projectId: number, categoryId: number) =>
    apiFetch<void>(`/api/projects/${projectId}/categories/${categoryId}`, { method: "DELETE" }),
  reorder: (projectId: number, ids: number[]) =>
    apiFetch<{ message: string }>(`/api/projects/${projectId}/categories/reorder`, {
      method: "PATCH",
      body: { ids },
    }),
};

export const fieldApi = {
  list: (projectId: number) =>
    apiFetch<App.Data.ProjectFieldData[]>(`/api/projects/${projectId}/fields`),
  create: (projectId: number, body: { name: string; type: App.Enums.ProjectFieldType; options?: string[] }) =>
    apiFetch<App.Data.ProjectFieldData>(`/api/projects/${projectId}/fields`, { method: "POST", body }),
  update: (
    projectId: number,
    fieldId: number,
    body: { name?: string; is_hidden?: boolean; options?: string[] },
  ) =>
    apiFetch<App.Data.ProjectFieldData>(`/api/projects/${projectId}/fields/${fieldId}`, {
      method: "PATCH",
      body,
    }),
  remove: (projectId: number, fieldId: number) =>
    apiFetch<void>(`/api/projects/${projectId}/fields/${fieldId}`, { method: "DELETE" }),
  reorder: (projectId: number, ids: number[]) =>
    apiFetch<{ message: string }>(`/api/projects/${projectId}/fields/reorder`, {
      method: "PATCH",
      body: { ids },
    }),
};

export const statusApi = {
  create: (projectId: number, body: { name: string; color?: string; category?: App.Enums.TaskStatusCategory }) =>
    apiFetch<App.Data.TaskStatusData>(`/api/projects/${projectId}/statuses`, { method: "POST", body }),
  update: (
    projectId: number,
    statusId: number,
    body: { name?: string; color?: string; is_hidden?: boolean },
  ) =>
    apiFetch<App.Data.TaskStatusData>(`/api/projects/${projectId}/statuses/${statusId}`, {
      method: "PATCH",
      body,
    }),
  remove: (projectId: number, statusId: number) =>
    apiFetch<void>(`/api/projects/${projectId}/statuses/${statusId}`, { method: "DELETE" }),
  reorder: (projectId: number, ids: number[]) =>
    apiFetch<{ message: string }>(`/api/projects/${projectId}/statuses/reorder`, {
      method: "PATCH",
      body: { ids },
    }),
};

export type TaskInput = {
  title?: string;
  description?: string | null;
  taskStatusId?: number;
  taskCategoryId?: number | null;
  assigneeUserIds?: number[];
  reporterUserId?: number | null;
  parentTaskId?: number | null;
  priority?: App.Enums.TaskPriority;
  progress?: number;
  dueDate?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  estimatedHours?: number | null;
  customFields?: Record<number, unknown>;
};

export const taskApi = {
  list: (projectId: number) => apiFetch<Task[]>(`/api/projects/${projectId}/tasks`),
  create: (projectId: number, data: TaskInput & { title: string }) =>
    apiFetch<Task>(`/api/projects/${projectId}/tasks`, { method: "POST", body: toSnake(data) }),
  get: (taskId: number) => apiFetch<Task>(`/api/tasks/${taskId}`),
  update: (taskId: number, data: TaskInput) =>
    apiFetch<Task>(`/api/tasks/${taskId}`, { method: "PATCH", body: toSnake(data) }),
  remove: (taskId: number) => apiFetch<void>(`/api/tasks/${taskId}`, { method: "DELETE" }),
  uploadAttachment: (taskId: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<App.Data.TaskAttachmentData>(`/api/tasks/${taskId}/attachments`, { formData: fd });
  },
  attachments: (taskId: number) =>
    apiFetch<App.Data.TaskAttachmentData[]>(`/api/tasks/${taskId}/attachments`),
  removeAttachment: (taskId: number, attachmentId: number) =>
    apiFetch<void>(`/api/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" }),
  comments: (taskId: number) =>
    apiFetch<App.Data.TaskCommentData[]>(`/api/tasks/${taskId}/comments`),
  addComment: (taskId: number, body: string) =>
    apiFetch<App.Data.TaskCommentData>(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body: { body },
    }),
  workLogs: (taskId: number) =>
    apiFetch<App.Data.WorkLogData[]>(`/api/tasks/${taskId}/work-logs`),
  logWork: (taskId: number, workedOn: string, hours: number, note?: string) =>
    apiFetch<App.Data.WorkLogData>(`/api/tasks/${taskId}/work-logs`, {
      method: "POST",
      body: { worked_on: workedOn, hours, note },
    }),
};

