import { apiClient } from "@/lib/api-client";
import type {
  AssignTicketInput,
  CreateTicketInput,
  ListTicketsQuery,
  Ticket,
  TicketEvent,
  UpdateTicketPriorityInput,
  UpdateTicketStatusInput,
} from "@supportdesk/shared";

export type TicketsListResponse = {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
};

export const ticketsService = {
  async list(query: Partial<ListTicketsQuery> = {}): Promise<TicketsListResponse> {
    const params: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "" && value !== "ALL") {
        params[key] = value;
      }
    }
    const { data } = await apiClient.get<TicketsListResponse>("/tickets", { params });
    return data;
  },
  async getById(id: string): Promise<Ticket> {
    const { data } = await apiClient.get<Ticket>(`/tickets/${id}`);
    return data;
  },
  async create(input: CreateTicketInput): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>("/tickets", input);
    return data;
  },
  async updateStatus(id: string, input: UpdateTicketStatusInput): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/status`, input);
    return data;
  },
  async updatePriority(id: string, input: UpdateTicketPriorityInput): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/priority`, input);
    return data;
  },
  async assign(id: string, input: AssignTicketInput): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/assignee`, input);
    return data;
  },
  async events(id: string): Promise<TicketEvent[]> {
    const { data } = await apiClient.get<TicketEvent[]>(`/tickets/${id}/events`);
    return data;
  },
};
