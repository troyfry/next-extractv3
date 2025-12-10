/**
 * Shared types for Work Orders across the application.
 * Used by both API routes and UI components.
 */

/**
 * Complete work order with all required fields.
 * Generated server-side: id and createdAt are always present.
 */
export type WorkOrder = {
  id: string;
  userId: string; // User ID from Google OAuth 'sub' claim
  timestampExtracted: string; // ISO string
  workOrderNumber: string;
  customerName: string | null;
  vendorName: string | null;
  serviceAddress: string | null;
  jobType: string | null;
  jobDescription: string | null;
  scheduledDate: string | null; // ISO string
  amount: string | null; // Decimal as string
  currency: string | null;
  notes: string | null;
  priority: string | null;
  calendarEventLink: string | null;
  workOrderPdfLink: string | null;
  createdAt: string; // ISO string
};

/**
 * Input type for creating work orders.
 * id, timestampExtracted, and createdAt are optional (generated server-side if missing).
 * userId is required - must be provided from the authenticated session.
 */
export type WorkOrderInput = {
  id?: string;
  userId: string; // Required: User ID from authenticated session
  timestampExtracted?: string; // ISO string
  workOrderNumber: string;
  customerName?: string | null;
  vendorName?: string | null;
  serviceAddress?: string | null;
  jobType?: string | null;
  jobDescription?: string | null;
  scheduledDate?: string | null; // ISO string
  amount?: string | null; // Decimal as string
  currency?: string | null;
  notes?: string | null;
  priority?: string | null;
  calendarEventLink?: string | null;
  workOrderPdfLink?: string | null;
  createdAt?: string; // ISO string
};

