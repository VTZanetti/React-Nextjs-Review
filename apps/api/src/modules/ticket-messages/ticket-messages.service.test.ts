import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminUser,
  createPrismaMock,
  customerUser,
  customerUserOther,
  ticketFixture,
} from "../../test/prisma-mock.js";

const prismaMock = createPrismaMock();

vi.mock("../../lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { ticketMessagesService } = await import("./ticket-messages.service.js");
const { ForbiddenError } = await import("../../lib/errors.js");

beforeEach(() => {
  for (const model of Object.values(prismaMock)) {
    if (typeof model === "object" && model !== null) {
      for (const fn of Object.values(model)) {
        if (typeof fn === "function" && "mockReset" in fn) {
          (fn as { mockReset: () => void }).mockReset();
        }
      }
    }
  }
  prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
    fn(prismaMock),
  );
});

describe("ticketMessagesService access checks", () => {
  it("lets the owning CUSTOMER list messages", async () => {
    const ticket = ticketFixture({ customerId: "customer-1" });
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: "customer-1" });
    prismaMock.ticketMessage.findMany.mockResolvedValueOnce([]);

    const result = await ticketMessagesService.list(ticket.id, customerUser);
    expect(result).toEqual([]);
  });

  it("blocks a different CUSTOMER from listing", async () => {
    const ticket = ticketFixture({ customerId: "customer-1" });
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: "customer-2" });

    await expect(
      ticketMessagesService.list(ticket.id, customerUserOther),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("does not check User.customerId for staff", async () => {
    const ticket = ticketFixture({ customerId: "customer-1" });
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    prismaMock.ticketMessage.findMany.mockResolvedValueOnce([]);

    await ticketMessagesService.list(ticket.id, adminUser);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
