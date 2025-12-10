/**
 * Repository interface for work orders.
 * This abstraction allows us to swap implementations without changing
 * the rest of the application.
 * 
 * Architecture:
 * - WorkOrder is the UI/API shape (ISO date strings)
 * - Drizzle workOrders schema represents the DB shape (Date objects)
 * - Mappers handle the conversion between these shapes
 * - workOrderRepo is the single gateway for persistence
 */
import { db } from "@/db/client";
import { workOrders } from "@/db/schema";
import { desc, inArray, eq, and } from "drizzle-orm";
import type { WorkOrder, WorkOrderInput } from "./types";
import { dbToWorkOrder, inputToDbInsert } from "./mappers";

export interface WorkOrderRepository {
  /**
   * Save multiple work orders.
   * Generates id and createdAt if not provided.
   * All work orders must have userId set.
   */
  saveMany(input: WorkOrderInput[]): Promise<WorkOrder[]>;

  /**
   * Get all work orders for a specific user.
   * @param userId - User ID to filter by
   * @param options - Optional query options (limit, etc.)
   */
  listForUser(userId: string, options?: { limit?: number }): Promise<WorkOrder[]>;

  /**
   * Get a work order by ID, but only if it belongs to the specified user.
   * @param userId - User ID to verify ownership
   * @param id - Work order ID
   */
  getByIdForUser(userId: string, id: string): Promise<WorkOrder | null>;

  /**
   * Find work orders by their work order numbers, scoped to a specific user.
   * Used for duplicate detection before inserting new work orders.
   * @param userId - User ID to filter by
   * @param numbers - Array of work order numbers to search for
   */
  findByWorkOrderNumbers(userId: string, numbers: string[]): Promise<WorkOrder[]>;

  /**
   * Clear all work orders for a specific user (useful for testing/reset).
   * @param userId - User ID to filter by
   */
  clearForUser(userId: string): Promise<void>;
}

/**
 * Drizzle/Postgres implementation of WorkOrderRepository.
 * 
 * This is the production implementation backed by a real Postgres database
 * (e.g., Neon) via Drizzle ORM.
 * All queries are user-scoped for security.
 */
class DrizzleWorkOrderRepository implements WorkOrderRepository {
  async saveMany(input: WorkOrderInput[]): Promise<WorkOrder[]> {
    // Validate that all inputs have userId
    for (const wo of input) {
      if (!wo.userId) {
        throw new Error("All work orders must have userId set");
      }
    }

    // Convert WorkOrderInput[] to DB insert format (dates as Date objects)
    const dbInserts = input.map(inputToDbInsert);

    // Insert into database and return the saved rows
    const savedRows = await db
      .insert(workOrders)
      .values(dbInserts)
      .returning();

    // Convert DB rows to WorkOrder[] (dates as ISO strings)
    return savedRows.map(dbToWorkOrder);
  }

  async listForUser(userId: string, options?: { limit?: number }): Promise<WorkOrder[]> {
    // Fetch work orders for the specified user, ordered by creation date (newest first)
    let query = db
      .select()
      .from(workOrders)
      .where(eq(workOrders.userId, userId))
      .orderBy(desc(workOrders.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }

    const rows = await query;

    // Convert DB rows to WorkOrder[] (dates as ISO strings)
    return rows.map(dbToWorkOrder);
  }

  async getByIdForUser(userId: string, id: string): Promise<WorkOrder | null> {
    // Fetch work order by ID, but only if it belongs to the specified user
    const rows = await db
      .select()
      .from(workOrders)
      .where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return dbToWorkOrder(rows[0]);
  }

  async findByWorkOrderNumbers(userId: string, numbers: string[]): Promise<WorkOrder[]> {
    if (numbers.length === 0) {
      return [];
    }

    // Query work orders where workOrderNumber is in the provided array AND belongs to the user
    const rows = await db
      .select()
      .from(workOrders)
      .where(
        and(
          eq(workOrders.userId, userId),
          inArray(workOrders.workOrderNumber, numbers)
        )
      );

    // Convert DB rows to WorkOrder[] (dates as ISO strings)
    return rows.map(dbToWorkOrder);
  }

  async clearForUser(userId: string): Promise<void> {
    // Delete all work orders for the specified user
    await db
      .delete(workOrders)
      .where(eq(workOrders.userId, userId));
  }
}

/**
 * In-memory implementation (kept for testing/development if needed).
 * This is no longer the default but can be useful for unit tests.
 */
class InMemoryWorkOrderRepository implements WorkOrderRepository {
  private store: WorkOrder[] = [];

  async saveMany(input: WorkOrderInput[]): Promise<WorkOrder[]> {
    const now = new Date().toISOString();
    const saved: WorkOrder[] = input.map((item) => ({
      id: item.id || crypto.randomUUID(),
      workOrderNumber: item.workOrderNumber,
      facility: item.facility,
      serviceType: item.serviceType,
      scheduledDate: item.scheduledDate,
      status: item.status,
      source: item.source,
      createdAt: item.createdAt || now,
    }));

    this.store.push(...saved);
    return saved;
  }

  async getAll(): Promise<WorkOrder[]> {
    return [...this.store];
  }

  async clear(): Promise<void> {
    this.store = [];
  }

  async findByWorkOrderNumbers(numbers: string[]): Promise<WorkOrder[]> {
    if (numbers.length === 0) {
      return [];
    }

    const numberSet = new Set(numbers);
    return this.store.filter((wo) => numberSet.has(wo.workOrderNumber));
  }
}

/**
 * Singleton repository instance.
 * 
 * Currently using DrizzleWorkOrderRepository (Postgres-backed).
 * To switch back to in-memory for testing, change this to:
 *   new InMemoryWorkOrderRepository()
 */
export const workOrderRepo: WorkOrderRepository =
  new DrizzleWorkOrderRepository();

