/**
 * Protocol format: SD-YYYYMMDD-XXXX (random base36 suffix)
 */
export function generateTicketProtocol(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SD-${yyyy}${mm}${dd}-${random}`;
}
