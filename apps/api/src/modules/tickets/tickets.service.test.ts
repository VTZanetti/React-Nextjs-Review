import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminUser,
  agentUser,
  createPrismaMock,
  customerUser,
  customerUserOther,
  ticketFixture,
} from "../../test/prisma-mock.js";

const prismaMock = createPrismaMock();

vi.mock("../../lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { ticketsService } = await import("./tickets.service.js");
const { ForbiddenError, NotFoundError } = await import("../../lib/errors.js");

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

describe("ticketsService.getById", () => {
  it("throws NotFoundError when the ticket does not exist", async () => {
    prismaMock.ticket.findUnique.mockResolvedValueOnce(null);
    await expect(ticketsService.getById("missing", adminUser)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("returns the ticket for ADMIN regardless of customer link", async () => {
    const ticket = ticketFixture();
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    const result = await ticketsService.getById(ticket.id, adminUser);
    expect(result.id).toBe(ticket.id);
    // ADMIN must NOT trigger the user.findUnique customer-link check
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns the ticket for AGENT regardless of customer link", async () => {
    const ticket = ticketFixture();
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    const result = await ticketsService.getById(ticket.id, agentUser);
    expect(result.id).toBe(ticket.id);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns the ticket for the CUSTOMER who owns it (link by User.customerId, not email)", async () => {
    // Reproduces the original bug: customer login email and customer record
    // email differ — access must still be granted.
    const ticket = ticketFixture({ customerId: "customer-1" });
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: "customer-1" });

    const result = await ticketsService.getById(ticket.id, customerUser);
    expect(result.id).toBe(ticket.id);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: customerUser.sub },
      select: { customerId: true },
    });
  });

  it("throws ForbiddenError when CUSTOMER tries to access another customer's ticket", async () => {
    const ticket = ticketFixture({ customerId: "customer-1" });
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: "customer-2" });

    await expect(ticketsService.getById(ticket.id, customerUserOther)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("throws ForbiddenError when CUSTOMER user has no linked customer record", async () => {
    const ticket = ticketFixture({ customerId: "customer-1" });
    prismaMock.ticket.findUnique.mockResolvedValueOnce(ticket);
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: null });

    await expect(ticketsService.getById(ticket.id, customerUser)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

describe("ticketsService.list", () => {
  it("scopes the query to the linked customer when role is CUSTOMER", async () => {
    prismaMock.ticket.findMany.mockResolvedValueOnce([]);
    prismaMock.ticket.count.mockResolvedValueOnce(0);

    await ticketsService.list(
      { search: undefined, page: 1, pageSize: 20 } as never,
      customerUser,
    );

    const call = prismaMock.ticket.findMany.mock.calls[0]?.[0];
    expect(call.where).toMatchObject({ customer: { user: { id: customerUser.sub } } });
  });

  it("does not apply a customer scope for staff", async () => {
    prismaMock.ticket.findMany.mockResolvedValueOnce([]);
    prismaMock.ticket.count.mockResolvedValueOnce(0);

    await ticketsService.list({ page: 1, pageSize: 20 } as never, adminUser);

    const call = prismaMock.ticket.findMany.mock.calls[0]?.[0];
    expect(call.where).not.toHaveProperty("customer");
  });
});

describe("ticketsService.create", () => {
  it("infers customerId from User.customerId when role is CUSTOMER", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: "customer-1" });
    prismaMock.customer.findUnique.mockResolvedValueOnce({ id: "customer-1" });
    const created = ticketFixture();
    prismaMock.ticket.create.mockResolvedValueOnce(created);
    prismaMock.ticketEvent.create.mockResolvedValue({});

    const result = await ticketsService.create(
      {
        title: "Title",
        description: "A description with enough length",
        priority: "MEDIUM",
        category: "OUTRO",
      } as never,
      customerUser,
    );

    expect(result.id).toBe(created.id);
    const ticketCreateCall = prismaMock.ticket.create.mock.calls[0]?.[0];
    expect(ticketCreateCall.data.customerId).toBe("customer-1");
  });

  it("rejects CUSTOMER without linked customer record", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ customerId: null });

    await expect(
      ticketsService.create(
        { title: "X", description: "A description with enough length", priority: "MEDIUM", category: "OUTRO" } as never,
        customerUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("requires explicit customerId when role is staff", async () => {
    await expect(
      ticketsService.create(
        { title: "X", description: "A description with enough length", priority: "MEDIUM", category: "OUTRO" } as never,
        adminUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
