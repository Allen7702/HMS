import { pgTable, serial, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { invoices } from './invoices';

export const paymentStatusEnum = pgEnum('payment_status', ['Pending', 'Completed', 'Failed', 'Refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash']);

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  
  amount: integer('amount').notNull(), // Amount of this specific transaction
  status: paymentStatusEnum('status').default('Pending').notNull(),
  method: paymentMethodEnum('method'),

  // CRITICAL: This is the unique ID from your payment provider
  transactionId: varchar('transaction_id', { length: 256 }).unique(),
  
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});