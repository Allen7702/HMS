import { pgTable, serial, varchar, text, timestamp, json, boolean } from 'drizzle-orm/pg-core';

export const hotels = pgTable('hotels', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    address: text('address').notNull(),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 256 }),
    website: varchar('website', { length: 256 }),
    description: text('description'),
    settings: json('settings').$type<{
        currency: string;
        timezone: string;
        checkInTime: string;
        checkOutTime: string;
        maxAdvanceBookingDays: number;
        cancellationPolicy: string;
        taxRate: number;
        serviceChargeRate: number;
        allowOnlineBooking: boolean;
        autoConfirmBookings: boolean;
        requireDeposit: boolean;
        depositPercentage: number;
    }>().default({
        currency: 'TZS',
        timezone: 'Africa/Dar_es_Salaam',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        maxAdvanceBookingDays: 365,
        cancellationPolicy: '24 hours before check-in for full refund',
        taxRate: 18,
        serviceChargeRate: 5,
        allowOnlineBooking: true,
        autoConfirmBookings: false,
        requireDeposit: true,
        depositPercentage: 50,
    }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
