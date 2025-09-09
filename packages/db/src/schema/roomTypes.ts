import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';

export const roomTypes = pgTable('room_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  capacity: integer('capacity').default(1).notNull(),
  priceModifier: integer('price_modifier').default(0),
});