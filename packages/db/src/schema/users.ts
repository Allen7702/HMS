
import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'staff']);

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    fullName: varchar('full_name', { length: 256 }),
    username: varchar('username', { length: 256 }).notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 256 }).notNull(),
    role: userRoleEnum('role').default('staff'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});