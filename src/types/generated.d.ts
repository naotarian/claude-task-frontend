declare namespace App.Data {
export type BillingSummaryData = {
plan: App.Data.PlanData;
projectCount: number;
};
export type OrganizationData = {
id: number;
name: string;
slug: string;
type: App.Enums.OrganizationType;
role: App.Enums.OrganizationRole | null;
};
export type OrganizationInvitationData = {
id: number;
email: string;
role: App.Enums.OrganizationRole;
expiresAt: string;
accepted: boolean;
};
export type OrganizationMemberData = {
id: number;
userId: number;
name: string;
email: string;
role: App.Enums.OrganizationRole;
positionId: number | null;
positionName: string | null;
};
export type OrganizationPositionData = {
id: number;
name: string;
};
export type PlanData = {
id: number;
code: string;
name: string;
priceMonthly: number;
maxProjects: number | null;
maxMembersPerProject: number | null;
maxStorageBytesPerProject: number | null;
};
export type ProjectData = {
id: number;
organizationId: number;
key: string;
name: string;
description: string | null;
status: App.Enums.ProjectStatus;
categoriesEnabled: boolean;
role: App.Enums.ProjectRole | null;
statuses: Array<any> | null;
fields: Array<any> | null;
categories: Array<any> | null;
};
export type ProjectFieldData = {
id: number;
name: string;
type: App.Enums.ProjectFieldType;
position: number;
isHidden: boolean;
options: Array<any>;
};
export type ProjectFieldOptionData = {
id: number;
label: string;
};
export type ProjectMemberData = {
id: number;
userId: number;
name: string;
email: string;
role: App.Enums.ProjectRole;
};
export type TaskAssigneeData = {
id: number;
name: string;
avatarPath: string | null;
};
export type TaskAttachmentData = {
id: number;
taskId: number;
originalName: string;
sizeBytes: number;
mimeType: string | null;
url: string;
uploadedByName: string | null;
createdAt: string;
};
export type TaskCategoryData = {
id: number;
name: string;
position: number;
};
export type TaskCommentData = {
id: number;
userId: number;
userName: string;
body: string;
createdAt: string;
};
export type TaskData = {
id: number;
projectId: number;
taskStatusId: number;
seqNumber: number;
title: string;
description: string | null;
categoryId: number | null;
categoryName: string | null;
assignees: Array<any>;
reporterId: number | null;
reporterName: string | null;
parentTaskId: number | null;
priority: App.Enums.TaskPriority;
progress: number;
dueDate: string | null;
plannedStartDate: string | null;
plannedEndDate: string | null;
actualStartDate: string | null;
actualEndDate: string | null;
estimatedHours: number | null;
actualHours: number;
customFields: Array<App.Data.TaskFieldValueData>;
};
export type TaskFieldValueData = {
fieldId: number;
value: any;
};
export type TaskStatusData = {
id: number;
name: string;
color: string;
category: App.Enums.TaskStatusCategory;
position: number;
isHidden: boolean;
isProtected: boolean;
};
export type UserData = {
id: number;
name: string;
email: string;
avatarPath: string | null;
emailVerified: boolean;
createdAt: string;
};
export type WorkLogData = {
id: number;
userId: number;
userName: string;
workedOn: string;
hours: number;
note: string | null;
};
}
declare namespace App.Enums {
export type OrganizationRole = 'owner' | 'admin' | 'member';
export type OrganizationType = 'organization' | 'personal';
export type ProjectFieldType = 'datetime' | 'text' | 'number' | 'select' | 'multiselect';
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type ProjectStatus = 'active' | 'archived';
export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskStatusCategory = 'todo' | 'in_progress' | 'done';
}
