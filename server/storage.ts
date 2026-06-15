import {
  calculations,
  leads,
  type Calculation,
  type InsertCalculation,
  type Lead,
  type InsertLead,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, sql, count, avg, and, gte } from "drizzle-orm";

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
  /** Admin analytics — aggregate simulator data */
  getAdminStats(): Promise<{
    totalSubmissions: number;
    totalLeads: number;
    conversionRate: number;
    byCountry: Array<{ country: string; count: number }>;
    byCurrency: Array<{ currency: string; count: number }>;
    averageFreedomScore: number;
    averageGapPercent: number;
    submissionsByDay: Array<{ date: string; count: number }>;
    topCountries: Array<{ country: string; count: number; avgScore: number }>;
    leadsByStatus: Array<{ status: string; count: number }>;
    recentSubmissions: Array<{
      id: string;
      country: string;
      age: number;
      gapPercent: number;
      freedomScore: number;
      createdAt: Date;
    }>;
  }>;
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

  async getAdminStats(): Promise<{
    totalSubmissions: number;
    totalLeads: number;
    conversionRate: number;
    byCountry: Array<{ country: string; count: number }>;
    byCurrency: Array<{ currency: string; count: number }>;
    averageFreedomScore: number;
    averageGapPercent: number;
    submissionsByDay: Array<{ date: string; count: number }>;
    topCountries: Array<{ country: string; count: number; avgScore: number }>;
    leadsByStatus: Array<{ status: string; count: number }>;
    recentSubmissions: Array<{
      id: string;
      country: string;
      age: number;
      gapPercent: number;
      freedomScore: number;
      createdAt: Date;
    }>;
  }> {
    // Get total submissions and basic counts
    const totalSubmissions = await db
      .select({ count: count() })
      .from(calculations);
    const submissionsCount = totalSubmissions[0]?.count || 0;

    const totalLeadsResult = await db
      .select({ count: count() })
      .from(leads);
    const leadsCount = totalLeadsResult[0]?.count || 0;

    const conversionRate = submissionsCount > 0 ? (leadsCount / submissionsCount) * 100 : 0;

    // By country (submissions)
    const byCountry = await db
      .select({
        country: calculations.country,
        count: count().as("count"),
      })
      .from(calculations)
      .groupBy(calculations.country)
      .orderBy(desc(count()));

    // By currency
    const byCurrency = await db
      .select({
        currency: calculations.currency,
        count: count().as("count"),
      })
      .from(calculations)
      .groupBy(calculations.currency)
      .orderBy(desc(count()));

    // Average scores
    const avgStats = await db
      .select({
        avgFreedomScore: avg(calculations.freedomScore),
        avgGapPercent: avg(calculations.gapPercent),
      })
      .from(calculations);

    const averageFreedomScore = avgStats[0]?.avgFreedomScore ? parseFloat(avgStats[0].avgFreedomScore.toString()) : 0;
    const averageGapPercent = avgStats[0]?.avgGapPercent ? parseFloat(avgStats[0].avgGapPercent.toString()) : 0;

    // Submissions by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissionsByDay = await db
      .select({
        date: sql<string>`DATE(${calculations.createdAt})`,
        count: count().as("count"),
      })
      .from(calculations)
      .where(gte(calculations.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${calculations.createdAt})`)
      .orderBy(sql`DATE(${calculations.createdAt})`);

    // Top 5 countries with average scores
    const topCountriesData = await db
      .select({
        country: calculations.country,
        count: count().as("count"),
        avgScore: avg(calculations.freedomScore).as("avgScore"),
      })
      .from(calculations)
      .groupBy(calculations.country)
      .orderBy(desc(count()))
      .limit(5);

    const topCountries = topCountriesData.map((row) => ({
      country: row.country,
      count: row.count,
      avgScore: row.avgScore ? parseFloat(row.avgScore.toString()) : 0,
    }));

    // Leads by status
    const leadsByStatus = await db
      .select({
        status: leads.leadStatus,
        count: count().as("count"),
      })
      .from(leads)
      .groupBy(leads.leadStatus)
      .orderBy(desc(count()));

    // Recent 10 submissions
    const recentSubmissions = await db
      .select({
        id: calculations.id,
        country: calculations.country,
        age: calculations.age,
        gapPercent: calculations.gapPercent,
        freedomScore: calculations.freedomScore,
        createdAt: calculations.createdAt,
      })
      .from(calculations)
      .orderBy(desc(calculations.createdAt))
      .limit(10);

    return {
      totalSubmissions: submissionsCount,
      totalLeads: leadsCount,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      byCountry: byCountry.map((row) => ({
        country: row.country,
        count: row.count,
      })),
      byCurrency: byCurrency.map((row) => ({
        currency: row.currency,
        count: row.count,
      })),
      averageFreedomScore: parseFloat(averageFreedomScore.toFixed(2)),
      averageGapPercent: parseFloat(averageGapPercent.toFixed(2)),
      submissionsByDay: submissionsByDay.map((row) => ({
        date: row.date,
        count: row.count,
      })),
      topCountries,
      leadsByStatus: leadsByStatus.map((row) => ({
        status: row.status || "unknown",
        count: row.count,
      })),
      recentSubmissions: recentSubmissions.map((row) => ({
        ...row,
        gapPercent: parseFloat(row.gapPercent.toString()),
      })),
    };
  }
}

export const storage = new DatabaseStorage();
