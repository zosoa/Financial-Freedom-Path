import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  age: integer("age").notNull(),
  monthlyIncome: doublePrecision("monthly_income").notNull(),
  desiredMonthlyIncome: doublePrecision("desired_monthly_income").notNull(),
  currentSavings: doublePrecision("current_savings").notNull(),
  monthlySavingsRate: doublePrecision("monthly_savings_rate").notNull(),
  expectedLumpSum: doublePrecision("expected_lump_sum").notNull().default(0),
  lumpSumAge: integer("lump_sum_age"),
  annualReturn: doublePrecision("annual_return").notNull().default(7),
  requiredCapital: doublePrecision("required_capital").notNull(),
  plannedCapital: doublePrecision("planned_capital").notNull(),
  gapPercent: doublePrecision("gap_percent").notNull(),
  freedomAge: integer("freedom_age").notNull(),
  freedomScore: integer("freedom_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calculationId: varchar("calculation_id").references(() => calculations.id),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  gapPercent: doublePrecision("gap_percent").notNull(),
  freedomScore: integer("freedom_score").notNull(),
  referralSource: text("referral_source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const SUPPORTED_CURRENCIES: Record<string, { symbol: string; code: string; name: string }> = {
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "\u20AC", code: "EUR", name: "Euro" },
  GBP: { symbol: "\u00A3", code: "GBP", name: "British Pound" },
  CHF: { symbol: "CHF", code: "CHF", name: "Swiss Franc" },
  SGD: { symbol: "S$", code: "SGD", name: "Singapore Dollar" },
  AUD: { symbol: "A$", code: "AUD", name: "Australian Dollar" },
  CAD: { symbol: "C$", code: "CAD", name: "Canadian Dollar" },
  HKD: { symbol: "HK$", code: "HKD", name: "Hong Kong Dollar" },
  AED: { symbol: "\u062F.\u0625", code: "AED", name: "UAE Dirham" },
  INR: { symbol: "\u20B9", code: "INR", name: "Indian Rupee" },
  MUR: { symbol: "\u20A8", code: "MUR", name: "Mauritian Rupee" },
  ZAR: { symbol: "R", code: "ZAR", name: "South African Rand" },
  JPY: { symbol: "\u00A5", code: "JPY", name: "Japanese Yen" },
  KRW: { symbol: "\u20A9", code: "KRW", name: "South Korean Won" },
  BRL: { symbol: "R$", code: "BRL", name: "Brazilian Real" },
  MXN: { symbol: "MX$", code: "MXN", name: "Mexican Peso" },
  THB: { symbol: "\u0E3F", code: "THB", name: "Thai Baht" },
  MYR: { symbol: "RM", code: "MYR", name: "Malaysian Ringgit" },
  PHP: { symbol: "\u20B1", code: "PHP", name: "Philippine Peso" },
  IDR: { symbol: "Rp", code: "IDR", name: "Indonesian Rupiah" },
  NGN: { symbol: "\u20A6", code: "NGN", name: "Nigerian Naira" },
  KES: { symbol: "KSh", code: "KES", name: "Kenyan Shilling" },
  EGP: { symbol: "E\u00A3", code: "EGP", name: "Egyptian Pound" },
  SAR: { symbol: "\uFDFC", code: "SAR", name: "Saudi Riyal" },
  QAR: { symbol: "QR", code: "QAR", name: "Qatari Riyal" },
  KWD: { symbol: "KD", code: "KWD", name: "Kuwaiti Dinar" },
  SEK: { symbol: "kr", code: "SEK", name: "Swedish Krona" },
  NOK: { symbol: "kr", code: "NOK", name: "Norwegian Krone" },
  DKK: { symbol: "kr", code: "DKK", name: "Danish Krone" },
  PLN: { symbol: "z\u0142", code: "PLN", name: "Polish Zloty" },
  CZK: { symbol: "K\u010D", code: "CZK", name: "Czech Koruna" },
  NZD: { symbol: "NZ$", code: "NZD", name: "New Zealand Dollar" },
  TWD: { symbol: "NT$", code: "TWD", name: "Taiwan Dollar" },
  TRY: { symbol: "\u20BA", code: "TRY", name: "Turkish Lira" },
};

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  "Germany": "EUR",
  "France": "EUR",
  "Italy": "EUR",
  "Spain": "EUR",
  "Netherlands": "EUR",
  "Belgium": "EUR",
  "Austria": "EUR",
  "Ireland": "EUR",
  "Portugal": "EUR",
  "Greece": "EUR",
  "Finland": "EUR",
  "Luxembourg": "EUR",
  "Switzerland": "CHF",
  "Singapore": "SGD",
  "Australia": "AUD",
  "Canada": "CAD",
  "Hong Kong": "HKD",
  "UAE": "AED",
  "India": "INR",
  "Mauritius": "MUR",
  "South Africa": "ZAR",
  "Japan": "JPY",
  "South Korea": "KRW",
  "Brazil": "BRL",
  "Mexico": "MXN",
  "Thailand": "THB",
  "Malaysia": "MYR",
  "Philippines": "PHP",
  "Indonesia": "IDR",
  "Nigeria": "NGN",
  "Kenya": "KES",
  "Egypt": "EGP",
  "Saudi Arabia": "SAR",
  "Qatar": "QAR",
  "Kuwait": "KWD",
  "Sweden": "SEK",
  "Norway": "NOK",
  "Denmark": "DKK",
  "Poland": "PLN",
  "Czech Republic": "CZK",
  "New Zealand": "NZD",
  "Taiwan": "TWD",
  "Turkey": "TRY",
};
