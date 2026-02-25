import { pgTable, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const savedLeads = pgTable("saved_leads", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  rating: real("rating"),
  reviews: integer("reviews").notNull().default(0),
  category: text("category"),
  website: text("website"),
  mapsUrl: text("maps_url"),
  placeId: text("place_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SavedLead = typeof savedLeads.$inferSelect;
export type NewSavedLead = typeof savedLeads.$inferInsert;
