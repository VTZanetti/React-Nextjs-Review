import { apiClient } from "@/lib/api-client";
import type { CreateTicketMessageInput, TicketMessage } from "@supportdesk/shared";

export const ticketMessagesService = {
  async list(ticketId: string): Promise<TicketMessage[]> {
    const { data } = await apiClient.get<TicketMessage[]>(`/tickets/${ticketId}/messages`);
    return data;
  },
  async create(ticketId: string, input: CreateTicketMessageInput): Promise<TicketMessage> {
    const { data } = await apiClient.post<TicketMessage>(`/tickets/${ticketId}/messages`, input);
    return data;
  },
};
