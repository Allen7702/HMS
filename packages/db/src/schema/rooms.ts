import { pgTable, serial, varchar, integer, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { roomTypes } from './roomTypes';

export const roomStatusEnum = pgEnum('room_status', ['Available', 'Occupied', 'Maintenance', 'Dirty']);

export const rooms = pgTable('rooms', {
    id: serial('id').primaryKey(),
    roomNumber: varchar('room_number', { length: 50 }).notNull().unique(),
    floor: integer('floor').notNull(),
    roomTypeId: integer('room_type_id').references(() => roomTypes.id),
    status: roomStatusEnum('status').default('Available').notNull(),
    features: jsonb('features'),
    lastCleaned: timestamp('last_cleaned'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});