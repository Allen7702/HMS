import { pgTable, serial, varchar, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { guests } from './guests';

export const notificationTypeEnum = pgEnum('notification_type', ['Email', 'SMS', 'Push']);
export const notificationStatusEnum = pgEnum('notification_status', ['Pending', 'Sent', 'Failed']);

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    type: notificationTypeEnum('type').notNull(),
    guestId: integer('guest_id').references(() => guests.id), // Link directly to a guest
    userId: integer('user_id').references(() => users.id),   // Or link to a system user
    recipient: varchar('recipient', { length: 255 }).notNull(),
    message: text('message').notNull(),
    status: notificationStatusEnum('status').notNull(),
    relatedEntityId: integer('related_entity_id'),
    entityType: varchar('entity_type', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
