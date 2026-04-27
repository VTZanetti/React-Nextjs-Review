import { apiClient } from "@/lib/api-client";
import type { AuthUser, LoginInput, LoginResponse } from "@supportdesk/shared";

export const authService = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", input);
    return data;
  },
  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>("/auth/me");
    return data;
  },
};
