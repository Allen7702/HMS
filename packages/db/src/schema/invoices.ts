import { pgTable, serial, integer, text, varchar, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { bookings } from './bookings';

// More descriptive statuses for the invoice lifecycle
export const invoiceStatusEnum = pgEnum('invoice_status', ['Draft', 'Unpaid', 'Paid', 'Void']);

export const invoices = pgTable('invoices', {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id').references(() => bookings.id),
    
    // Using integer for money (in cents) is safer to avoid floating-point errors
    amount: integer('amount').notNull(), 
    tax: integer('tax').notNull(),

    // Renamed 'receipt' to be more specific. Is it a number or a URL to a PDF?
    invoiceNumber: varchar('invoice_number', { length: 100 }).unique(), 
    
    status: invoiceStatusEnum('status').default('Unpaid').notNull(),
    issueDate: timestamp('issue_date').defaultNow().notNull(),
    dueDate: timestamp('due_date'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('idx_invoices_booking_id').on(table.bookingId),
]);