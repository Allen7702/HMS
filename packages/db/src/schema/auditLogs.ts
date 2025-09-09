import { pgTable, serial, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
    id: serial('id').primaryKey(),
    action: varchar('action', { length: 100 }).notNull(),
    userId: integer('user_id').references(() => users.id),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: integer('entity_id'),
    details: jsonb('details'),
    dataBefore: jsonb('data_before'),
    dataAfter: jsonb('data_after'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
