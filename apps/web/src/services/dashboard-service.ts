import { apiClient } from "@/lib/api-client";
import type { DashboardMetrics } from "@supportdesk/shared";

export const dashboardService = {
  async metrics(): Promise<DashboardMetrics> {
    const { data } = await apiClient.get<DashboardMetrics>("/dashboard/metrics");
    return data;
  },
};
