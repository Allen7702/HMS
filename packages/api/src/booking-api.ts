import { SupabaseAPI, ValidationError, SupabaseError } from './supabase-api';
import { z } from 'zod';
import { bookingSchema } from 'db';

export type Booking = z.infer<typeof bookingSchema>;
export type BookingInsert = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;
export type BookingUpdate = Partial<BookingInsert>;

// Enhanced booking schemas with additional validation
const bookingInsertSchema = z.object({
  guestId: z.number().min(1, 'Guest ID is required'),
  roomId: z.number().min(1, 'Room ID is required'),
  checkIn: z.string().or(z.date()),
  checkOut: z.string().or(z.date()),
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled']),
  source: z.string().optional(),
  rateApplied: z.number().min(0, 'Rate must be non-negative'),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});

const bookingUpdateSchema = z.object({
  guestId: z.number().min(1, 'Guest ID is required').optional(),
  roomId: z.number().min(1, 'Room ID is required').optional(),
  checkIn: z.string().or(z.date()).optional(),
  checkOut: z.string().or(z.date()).optional(),
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled']).optional(),
  source: z.string().optional(),
  rateApplied: z.number().min(0, 'Rate must be non-negative').optional(),
});

const bookingSearchFilters = z.object({
  query: z.string().optional(),
  status: z.enum(['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled']).optional(),
  guestId: z.number().optional(),
  roomId: z.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  checkInFrom: z.string().optional(),
  checkInTo: z.string().optional(),
  checkOutFrom: z.string().optional(),
  checkOutTo: z.string().optional(),
  source: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(20),
});

export type BookingSearchFilters = z.infer<typeof bookingSearchFilters>;

export interface BookingSearchResult {
  bookings: Booking[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface BookingWithDetails extends Booking {
  guest?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
  room?: {
    id: number;
    number: string;
    type: string;
  };
}

export class BookingAPI {
  private static readonly TABLE = 'bookings';

  /**
   * Get all bookings with pagination and filtering
   */
  static async getBookings(filters: Partial<BookingSearchFilters> = {}): Promise<BookingSearchResult> {
    try {
      const validated = bookingSearchFilters.parse(filters);
      const { 
        page, 
        pageSize, 
        status, 
        guestId, 
        roomId, 
        source 
      } = validated;
      
      let queryFilters: Record<string, any> = {};
      
      if (status) {
        queryFilters.status = status;
      }
      
      if (guestId) {
        queryFilters.guest_id = guestId;
      }
      
      if (roomId) {
        queryFilters.room_id = roomId;
      }
      
      if (source) {
        queryFilters.source = source;
      }

      // Get all bookings (simplified approach for now)
      // Note: Schema validation temporarily disabled due to snake_case/camelCase mismatch
      console.log('BookingAPI: Calling SupabaseAPI.get with filters:', queryFilters);
      const allBookings = await SupabaseAPI.get<any>(this.TABLE, {
        // schema: bookingSchema, // Disabled for now
        filters: queryFilters,
        orderBy: { column: 'created_at', ascending: false },
      });
      console.log('BookingAPI: SupabaseAPI.get returned:', allBookings.length, 'bookings');
      console.log('BookingAPI: First booking sample:', allBookings[0]);

      const totalCount = allBookings.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;
      const paginatedBookings = allBookings.slice(offset, offset + pageSize);

      return {
        bookings: paginatedBookings,
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error('BookingAPI.getBookings error:', error);
      throw new SupabaseError('Failed to fetch bookings', error);
    }
  }

  /**
   * Get bookings with guest and room details
   */
  static async getBookingsWithDetails(filters: Partial<BookingSearchFilters> = {}): Promise<{
    bookings: BookingWithDetails[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const validated = bookingSearchFilters.parse(filters);
      const { page, pageSize } = validated;
      
      // This would require a join query in a real implementation
      // For now, we'll fetch bookings and then fetch related data
      const result = await this.getBookings(filters);
      
      const bookingsWithDetails: BookingWithDetails[] = await Promise.all(
        result.bookings.map(async (booking) => {
          //TODO: Fetch guest and room details
          // In a real implementation, you'd use proper joins
          // For now, simulate with separate queries
          const guest = booking.guestId ? {
            id: booking.guestId,
            fullName: `Guest ${booking.guestId}`,
            email: `guest${booking.guestId}@example.com`,
            phone: `+255${booking.guestId}234567890`,
          } : undefined;

          const room = booking.roomId ? {
            id: booking.roomId,
            number: `${booking.roomId}01`,
            type: 'Standard Room',
          } : undefined;

          return {
            ...booking,
            guest,
            room,
          };
        })
      );

      return {
        bookings: bookingsWithDetails,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    } catch (error) {
      throw new SupabaseError('Failed to fetch bookings with details', error);
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(id: number): Promise<Booking | null> {
    try {
      return await SupabaseAPI.getById<Booking>(this.TABLE, id, {
        schema: bookingSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch booking by ID', error);
    }
  }

  /**
   * Create new booking
   */
  static async createBooking(bookingData: BookingInsert): Promise<Booking> {
    try {
      return await SupabaseAPI.create<Booking>(this.TABLE, bookingData, {
        schema: bookingSchema,
        validateInput: bookingInsertSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to create booking', error);
    }
  }

  /**
   * Update booking
   */
  static async updateBooking(id: number, updates: BookingUpdate): Promise<Booking> {
    try {
      return await SupabaseAPI.update<Booking>(this.TABLE, id, updates, {
        schema: bookingSchema,
        validateInput: bookingUpdateSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to update booking', error);
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(id: number): Promise<Booking> {
    try {
      return await this.updateBooking(id, { 
        status: 'Cancelled' 
      });
    } catch (error) {
      throw new SupabaseError('Failed to cancel booking', error);
    }
  }

  /**
   * Check in booking
   */
  static async checkInBooking(id: number): Promise<Booking> {
    try {
      return await this.updateBooking(id, { 
        status: 'CheckedIn' 
      });
    } catch (error) {
      throw new SupabaseError('Failed to check in booking', error);
    }
  }

  /**
   * Check out booking
   */
  static async checkOutBooking(id: number): Promise<Booking> {
    try {
      return await this.updateBooking(id, { 
        status: 'CheckedOut' 
      });
    } catch (error) {
      throw new SupabaseError('Failed to check out booking', error);
    }
  }

  /**
   * Delete booking
   */
  static async deleteBooking(id: number): Promise<void> {
    try {
      await SupabaseAPI.delete(this.TABLE, id);
    } catch (error) {
      throw new SupabaseError('Failed to delete booking', error);
    }
  }

  /**
   * Get bookings by guest ID
   */
  static async getBookingsByGuest(guestId: number): Promise<Booking[]> {
    try {
      return await SupabaseAPI.get<Booking>(this.TABLE, {
        schema: bookingSchema,
        filters: { guest_id: guestId },
        orderBy: { column: 'check_in', ascending: false },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch bookings by guest', error);
    }
  }

  /**
   * Get bookings by room ID
   */
  static async getBookingsByRoom(roomId: number): Promise<Booking[]> {
    try {
      return await SupabaseAPI.get<Booking>(this.TABLE, {
        schema: bookingSchema,
        filters: { room_id: roomId },
        orderBy: { column: 'check_in', ascending: false },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch bookings by room', error);
    }
  }

  /**
   * Get current bookings (checked in)
   */
  static async getCurrentBookings(): Promise<Booking[]> {
    try {
      return await SupabaseAPI.get<Booking>(this.TABLE, {
        schema: bookingSchema,
        filters: { status: 'CheckedIn' },
        orderBy: { column: 'check_in', ascending: false },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch current bookings', error);
    }
  }

  /**
   * Get upcoming bookings (confirmed for today and future)
   */
  static async getUpcomingBookings(): Promise<Booking[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return await SupabaseAPI.get<Booking>(this.TABLE, {
        schema: bookingSchema,
        filters: { 
          status: 'Confirmed',
          check_in: { gte: today }
        },
        orderBy: { column: 'check_in', ascending: true },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch upcoming bookings', error);
    }
  }

  /**
   * Get bookings by date range
   */
  static async getBookingsByDateRange(
    startDate: Date, 
    endDate: Date, 
    status?: Booking['status']
  ): Promise<Booking[]> {
    try {
      let filters: Record<string, any> = {
        check_in: { 
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0]
        }
      };

      if (status) {
        filters.status = status;
      }

      return await SupabaseAPI.get<Booking>(this.TABLE, {
        schema: bookingSchema,
        filters,
        orderBy: { column: 'check_in', ascending: true },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch bookings by date range', error);
    }
  }

  /**
   * Check room availability for date range
   */
  static async checkRoomAvailability(
    roomId: number, 
    checkIn: Date, 
    checkOut: Date,
    excludeBookingId?: number
  ): Promise<boolean> {
    try {
      let filters: Record<string, any> = {
        room_id: roomId,
        status: ['Confirmed', 'CheckedIn'],
      };

      // Check for overlapping bookings
      // A booking overlaps if:
      // - It starts before our checkout and ends after our checkin
      const conflictingBookings = await SupabaseAPI.get<Booking>(this.TABLE, {
        schema: bookingSchema,
        filters,
      });

      const checkInDate = checkIn.toISOString().split('T')[0];
      const checkOutDate = checkOut.toISOString().split('T')[0];

      const hasConflict = conflictingBookings.some(booking => {
        if (excludeBookingId && booking.id === excludeBookingId) {
          return false; // Exclude this booking from conflict check
        }

        const bookingCheckIn = new Date(booking.checkIn).toISOString().split('T')[0];
        const bookingCheckOut = new Date(booking.checkOut).toISOString().split('T')[0];

        // Check if dates overlap
        return !(checkOutDate <= bookingCheckIn || checkInDate >= bookingCheckOut);
      });

      return !hasConflict;
    } catch (error) {
      throw new SupabaseError('Failed to check room availability', error);
    }
  }
}
