import {
  calculations,
  leads,
  type Calculation,
  type InsertCalculation,
  type Lead,
  type InsertLead,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createCalculation(data: InsertCalculation): Promise<Calculation>;
  getCalculation(id: string): Promise<Calculation | undefined>;
  getRecentCalculations(limit?: number): Promise<Calculation[]>;
  createLead(data: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  getRecentLeads(limit?: number): Promise<Lead[]>;
  /** GDPR — hard-delete a lead by id. Returns true if a row was removed. */
  deleteLead(id: string): Promise<boolean>;
  /** GDPR — hard-delete every lead matching an email (case-insensitive). */
  deleteLeadsByEmail(email: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async createCalculation(data: InsertCalculation): Promise<Calculation> {
    const [calc] = await db
      .insert(calculations)
      .values(data)
      .returning();
    return calc;
  }

  async getCalculation(id: string): Promise<Calculation | undefined> {
    const [calc] = await db
      .select()
      .from(calculations)
      .where(eq(calculations.id, id));
    return calc || undefined;
  }

  async getRecentCalculations(limit = 50): Promise<Calculation[]> {
    return db
      .select()
      .from(calculations)
      .orderBy(desc(calculations.createdAt))
      .limit(limit);
  }

  async createLead(data: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(data)
      .returning();
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));
    return lead || undefined;
  }

  async getRecentLeads(limit = 50): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(limit);
  }

  async deleteLead(id: string): Promise<boolean> {
    const deleted = await db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning({ id: leads.id });
    return deleted.length > 0;
  }

  async deleteLeadsByEmail(email: string): Promise<number> {
    const norm = email.trim().toLowerCase();
    const deleted = await db
      .delete(leads)
      .where(eq(leads.email, norm))
      .returning({ id: leads.id });
    return deleted.length;
  }
}

export const storage = new DatabaseStorage();
