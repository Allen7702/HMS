import { pgTable, serial, varchar, integer, text, jsonb, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const loyaltyTierEnum = pgEnum('loyalty_tier', ['None', 'Bronze', 'Silver', 'Gold']);

export const guests = pgTable('guests', {
    id: serial('id').primaryKey(),
    fullName: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),

    preferences: jsonb('preferences'),

    loyaltyPoints: integer('loyalty_points').default(0),
    loyaltyTier: loyaltyTierEnum('loyalty_tier').default('None'),

    gdprConsent: boolean('gdpr_consent').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
});