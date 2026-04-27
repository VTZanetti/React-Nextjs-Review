import { apiClient } from "@/lib/api-client";
import type {
  CreateCustomerInput,
  Customer,
  ListCustomersQuery,
  UpdateCustomerInput,
} from "@supportdesk/shared";
import type { Ticket } from "@supportdesk/shared";

export type CustomersListResponse = {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
};

export type CustomerDetail = Customer & { tickets: Ticket[] };

export const customersService = {
  async list(query: Partial<ListCustomersQuery> = {}): Promise<CustomersListResponse> {
    const { data } = await apiClient.get<CustomersListResponse>("/customers", { params: query });
    return data;
  },
  async getById(id: string): Promise<CustomerDetail> {
    const { data } = await apiClient.get<CustomerDetail>(`/customers/${id}`);
    return data;
  },
  async create(input: CreateCustomerInput): Promise<Customer> {
    const { data } = await apiClient.post<Customer>("/customers", input);
    return data;
  },
  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};
