import { pgTable, serial, integer, text, varchar, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { rooms } from './rooms';
import { users } from './users';

export const maintenanceStatusEnum = pgEnum('maintenance_status', ['Open', 'In Progress', 'Resolved']);
export const maintenancePriorityEnum = pgEnum('maintenance_priority', ['Low', 'Medium', 'High']);

export const maintenances = pgTable('maintenances', {
    id: serial('id').primaryKey(),
    roomId: integer('room_id').references(() => rooms.id),
    description: text('description').notNull(),
    status: maintenanceStatusEnum('status').notNull(),
    priority: maintenancePriorityEnum('priority').notNull(),
    assigneeId: integer('assignee_id').references(() => users.id),
    history: jsonb('history'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
