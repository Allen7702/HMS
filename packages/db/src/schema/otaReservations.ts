import { pgTable, serial, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { bookings } from './bookings';
export const otaNameEnum = pgEnum('ota_name', ['Booking.com', 'Expedia', 'Agoda', 'Other']);
    
export const otaReservations = pgTable('ota_reservations', {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id').references(() => bookings.id),
    otaId: varchar('ota_id', { length: 100 }).notNull(),
    otaName: otaNameEnum('ota_name').notNull(), 
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
