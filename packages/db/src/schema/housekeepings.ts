import { pgTable, serial, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { rooms } from './rooms';
import { users } from './users';

export const housekeepingStatusEnum = pgEnum('housekeeping_status', ['Pending', 'In Progress', 'Completed']);

export const housekeepings = pgTable('housekeepings', {
    id: serial('id').primaryKey(),
    roomId: integer('room_id').references(() => rooms.id),
    status: housekeepingStatusEnum('status').notNull(),
    assigneeId: integer('assignee_id').references(() => users.id),
    scheduledDate: timestamp('scheduled_date').defaultNow(),
    completedAt: timestamp('completed_at'),
    notes: varchar('notes', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
