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

// Payment schema with validation
export const paymentSchema = createSelectSchema(payments);
export const paymentInsertSchema = createInsertSchema(payments, {
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['Pending', 'Completed', 'Failed', 'Refunded']),
  method: z.enum(['Credit Card', 'PayPal', 'Bank Transfer', 'Cash']).optional(),
  transactionId: z.string().min(1, 'Transaction ID is required').optional(),
});
export const paymentUpdateSchema = paymentInsertSchema.partial().omit({ id: true, processedAt: true });

// Invoice schema with validation
export const invoiceSchema = createSelectSchema(invoices);
export const invoiceInsertSchema = createInsertSchema(invoices, {
  amount: z.number().positive('Amount must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  invoiceNumber: z.string().min(1, 'Invoice number is required').optional(),
  status: z.enum(['Draft', 'Unpaid', 'Paid', 'Void']),
});
export const invoiceUpdateSchema = invoiceInsertSchema.partial().omit({ id: true, createdAt: true });

// Housekeeping schema with validation
export const housekeepingSchema = createSelectSchema(housekeepings);
export const housekeepingInsertSchema = createInsertSchema(housekeepings, {
  status: z.enum(['Pending', 'In Progress', 'Completed']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  scheduledDate: z.string().datetime().optional(),
});
export const housekeepingUpdateSchema = housekeepingInsertSchema.partial().omit({ id: true, createdAt: true });

// Maintenance schema with validation
export const maintenanceSchema = createSelectSchema(maintenances);
export const maintenanceInsertSchema = createInsertSchema(maintenances, {
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['Open', 'In Progress', 'Resolved']),
  priority: z.enum(['Low', 'Medium', 'High']),
});
export const maintenanceUpdateSchema = maintenanceInsertSchema.partial().omit({ id: true, createdAt: true });

// Notification schema
export const notificationSchema = createSelectSchema(notifications);

// Audit Log schema
export const auditLogSchema = createSelectSchema(auditLogs);

// OTA Reservation schema
export const otaReservationSchema = createSelectSchema(otaReservations);

// Hotel schema with validation
export const hotelSchema = createSelectSchema(hotels);
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
  hotel: hotelSchema,
  hotelInsert: hotelInsertSchema,
  hotelUpdate: hotelUpdateSchema,

  // Housekeeping (keep separate for different operations)
  housekeeping: housekeepingSchema,
  housekeepingInsert: housekeepingInsertSchema,
  housekeepingUpdate: housekeepingUpdateSchema,

  // Maintenance (keep separate for different operations)
  maintenance: maintenanceSchema,
  maintenanceInsert: maintenanceInsertSchema,
  maintenanceUpdate: maintenanceUpdateSchema,

  // Payment (keep separate for different operations)
  payment: paymentSchema,
  paymentInsert: paymentInsertSchema,
  paymentUpdate: paymentUpdateSchema,

  // Invoice (keep separate for different operations)
  invoice: invoiceSchema,
  invoiceInsert: invoiceInsertSchema,
  invoiceUpdate: invoiceUpdateSchema,

  // Single schemas for other entities
  guest: guestSchema,
  room: roomSchema,
  roomType: roomTypeSchema,
  booking: bookingSchema,
  notification: notificationSchema,
  auditLog: auditLogSchema,
  otaReservation: otaReservationSchema,
} as const;

// Type exports for better TypeScript support
export type UserSelect = z.infer<typeof userSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export type Hotel = z.infer<typeof hotelSchema>;
export type HotelInsert = z.infer<typeof hotelInsertSchema>;
export type HotelUpdate = z.infer<typeof hotelUpdateSchema>;

export type Housekeeping = z.infer<typeof housekeepingSchema>;
export type HousekeepingInsert = z.infer<typeof housekeepingInsertSchema>;
export type HousekeepingUpdate = z.infer<typeof housekeepingUpdateSchema>;

export type Maintenance = z.infer<typeof maintenanceSchema>;
export type MaintenanceInsert = z.infer<typeof maintenanceInsertSchema>;
export type MaintenanceUpdate = z.infer<typeof maintenanceUpdateSchema>;

export type Guest = z.infer<typeof guestSchema>;
export type Room = z.infer<typeof roomSchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentInsert = z.infer<typeof paymentInsertSchema>;
export type PaymentUpdate = z.infer<typeof paymentUpdateSchema>;

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceInsert = z.infer<typeof invoiceInsertSchema>;
export type InvoiceUpdate = z.infer<typeof invoiceUpdateSchema>;

export type Booking = z.infer<typeof bookingSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type OtaReservation = z.infer<typeof otaReservationSchema>;
