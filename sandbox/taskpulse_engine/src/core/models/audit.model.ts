/**
 * Audit Model Definitions
 * Target file for Practical 3.3 (Multi-File Composer Orchestration)
 */

export enum AuditAction {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  STATUS_CHANGED = "STATUS_CHANGED",
}

export interface AuditRecord {
  id: string;
  taskId: string;
  action: AuditAction;
  timestamp: string;
  actor?: string;
  payload?: Record<string, unknown>;
  changes?: Record<string, unknown>;
}
