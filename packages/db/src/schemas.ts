import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema/users';
import { guests } from './schema/guests';
import { rooms } from './schema/rooms';
import { roomTypes } from './schema/roomTypes';
import { bookings } from './schema/bookings';
import { payments } from './schema/payments';
import { invoices } from './schema/invoices';
import { housekeepings } from './schema/housekeepings';
import { maintenances } from './schema/maintenances';
import { notifications } from './schema/notifications';
import { auditLogs } from './schema/auditLogs';
import { otaReservations } from './schema/otaReservations';
import { hotels } from './schema/hotels';

// User schemas
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});
export const userUpdateSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
}).partial().omit({ id: true, createdAt: true });

// Guest schema
export const guestSchema = createSelectSchema(guests);

// Room schema
export const roomSchema = createSelectSchema(rooms);

// Room Type schema
export const roomTypeSchema = createSelectSchema(roomTypes);

// Booking schema
export const bookingSchema = createSelectSchema(bookings);

// Payment schema
export const paymentSchema = createSelectSchema(payments);

// Invoice schema
export const invoiceSchema = createSelectSchema(invoices);

// Housekeeping schema
export const housekeepingSchema = createSelectSchema(housekeepings);

// Maintenance schema
export const maintenanceSchema = createSelectSchema(maintenances);

// Notification schema
export const notificationSchema = createSelectSchema(notifications);

// Audit Log schema
export const auditLogSchema = createSelectSchema(auditLogs);

// OTA Reservation schema
export const otaReservationSchema = createSelectSchema(otaReservations);

// Hotel schema with validation
export const hotelSelectSchema = createSelectSchema(hotels);
export const hotelInsertSchema = createInsertSchema(hotels, {
  name: z.string().min(1, 'Hotel name is required'),
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
});
export const hotelUpdateSchema = hotelInsertSchema.partial().omit({ id: true, createdAt: true });

// Export all schemas for easy import
export const schemas = {
  // User (keep separate for different operations)
  userSelect: userSelectSchema,
  userInsert: userInsertSchema,
  userUpdate: userUpdateSchema,
  
  // Hotel (keep separate for different operations)
  hotelSelect: hotelSelectSchema,
  hotelInsert: hotelInsertSchema,
  hotelUpdate: hotelUpdateSchema,
  
  // Single schemas for other entities
  guest: guestSchema,
  room: roomSchema,
  roomType: roomTypeSchema,
  booking: bookingSchema,
  payment: paymentSchema,
  invoice: invoiceSchema,
  housekeeping: housekeepingSchema,
  maintenance: maintenanceSchema,
  notification: notificationSchema,
  auditLog: auditLogSchema,
  otaReservation: otaReservationSchema,
} as const;

// Type exports for better TypeScript support
export type UserSelect = z.infer<typeof userSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export type HotelSelect = z.infer<typeof hotelSelectSchema>;
export type HotelInsert = z.infer<typeof hotelInsertSchema>;
export type HotelUpdate = z.infer<typeof hotelUpdateSchema>;

export type Guest = z.infer<typeof guestSchema>;
export type Room = z.infer<typeof roomSchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type Housekeeping = z.infer<typeof housekeepingSchema>;
export type Maintenance = z.infer<typeof maintenanceSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type OtaReservation = z.infer<typeof otaReservationSchema>;
