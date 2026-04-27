import { apiClient } from "@/lib/api-client";
import type { User } from "@supportdesk/shared";

export const usersService = {
  async listAgents(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>("/users/agents");
    return data;
  },
};
