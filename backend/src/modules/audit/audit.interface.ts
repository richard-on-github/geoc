export interface AuditQueryParams {
  page: number;
  limit: number;
  action?: string;
  userId?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
