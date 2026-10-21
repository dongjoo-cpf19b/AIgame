import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
export const gameSessions = sqliteTable("game_sessions", {
 id:text("id").primaryKey(), tokenHash:text("token_hash").notNull(), startedAt:integer("started_at").notNull(), updatedAt:integer("updated_at").notNull(), completedAt:integer("completed_at"), progress:text("progress").notNull().default("{}"), clues:integer("clues").notNull().default(0), score:integer("score"), grade:text("grade"), messengerHints:integer("messenger_hints").notNull().default(0), phoneHints:integer("phone_hints").notNull().default(0)
},t=>[index("sessions_completed").on(t.completedAt)]);
export const raffleEntries=sqliteTable("raffle_entries",{
 id:text("id").primaryKey(), sessionId:text("session_id").notNull().references(()=>gameSessions.id), name:text("name").notNull(), affiliation:text("affiliation").notNull(), phone:text("phone").notNull(), consentVersion:text("consent_version").notNull(), consentedAt:integer("consented_at").notNull(), createdAt:integer("created_at").notNull(), winner:integer("winner").notNull().default(0), drawId:text("draw_id"), drawnAt:integer("drawn_at")
},t=>[uniqueIndex("raffle_phone_unique").on(t.phone),uniqueIndex("raffle_session_unique").on(t.sessionId)]);
export const adminSessions=sqliteTable("admin_sessions",{tokenHash:text("token_hash").primaryKey(),expiresAt:integer("expires_at").notNull()});
export const rateLimits=sqliteTable("rate_limits",{key:text("key").primaryKey(),count:integer("count").notNull().default(0),resetAt:integer("reset_at").notNull()});
export const auditLog=sqliteTable("audit_log",{id:text("id").primaryKey(),action:text("action").notNull(),detail:text("detail").notNull(),createdAt:integer("created_at").notNull()});
