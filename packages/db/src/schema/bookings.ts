import { pgTable, serial, integer, date, varchar, decimal, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { guests } from './guests';
import { rooms } from './rooms';

export const bookingStatusEnum = pgEnum('booking_status', ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled']);

export const bookings = pgTable('bookings', {
    id: serial('id').primaryKey(),
    guestId: integer('guest_id').references(() => guests.id),
    roomId: integer('room_id').references(() => rooms.id),
    checkIn: timestamp('check_in', { withTimezone: true }).notNull(),
    checkOut: timestamp('check_out', { withTimezone: true }).notNull(),
    status: bookingStatusEnum('status').notNull(),
    source: varchar('source', { length: 50 }),
    rateApplied: integer('rate_applied').notNull(), 
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('idx_bookings_guest_id').on(table.guestId),
]);
