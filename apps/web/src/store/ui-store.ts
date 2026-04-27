"use client";

import { create } from "zustand";
import type { TicketCategory, TicketPriority, TicketStatus } from "@supportdesk/shared";

type TicketFilters = {
  search: string;
  status: TicketStatus | "ALL";
  priority: TicketPriority | "ALL";
  category: TicketCategory | "ALL";
};

type UIState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  ticketFilters: TicketFilters;
  setTicketFilter: <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => void;
  resetTicketFilters: () => void;
};

const defaultFilters: TicketFilters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  category: "ALL",
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  ticketFilters: defaultFilters,
  setTicketFilter: (key, value) =>
    set((s) => ({ ticketFilters: { ...s.ticketFilters, [key]: value } })),
  resetTicketFilters: () => set({ ticketFilters: defaultFilters }),
}));
