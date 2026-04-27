import { z } from "zod";
import { ticketSchema } from "./tickets";

export const dashboardMetricsSchema = z.object({
  total: z.number(),
  open: z.number(),
  inProgress: z.number(),
  resolved: z.number(),
  critical: z.number(),
  slaBreached: z.number(),
  recent: z.array(ticketSchema),
});
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
