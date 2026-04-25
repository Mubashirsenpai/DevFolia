export const PROJECT_STATUSES = [
  "COMPLETED",
  "IN_PROGRESS",
  "JUST_STARTED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function parseProjectStatus(v: string): ProjectStatus {
  if (PROJECT_STATUSES.includes(v as ProjectStatus)) {
    return v as ProjectStatus;
  }
  return "JUST_STARTED";
}
