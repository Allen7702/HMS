import { SupabaseAPI, ValidationError, SupabaseError } from './supabase-api';
import { z } from 'zod';

// Hotel types (will be imported from db package once built)
interface HotelSettings {
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
}

export interface Hotel {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  settings: HotelSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HotelInsert = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>;
export type HotelUpdate = Partial<HotelInsert>;

// Basic validation schemas
const hotelSettingsSchema = z.object({
  currency: z.string(),
  timezone: z.string(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  maxAdvanceBookingDays: z.number(),
  cancellationPolicy: z.string(),
  taxRate: z.number(),
  serviceChargeRate: z.number(),
  allowOnlineBooking: z.boolean(),
  autoConfirmBookings: z.boolean(),
  requireDeposit: z.boolean(),
  depositPercentage: z.number(),
});

const hotelSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  settings: hotelSettingsSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class HotelAPI {
  private static readonly TABLE = 'hotels';

  /**
   * Get the active hotel settings (assuming single hotel setup)
   */
  static async getHotelSettings(): Promise<Hotel | null> {
    try {
      const hotels = await SupabaseAPI.get<Hotel>(this.TABLE, {
        schema: hotelSchema,
        filters: { is_active: true },
        limit: 1,
        orderBy: { column: 'created_at', ascending: false }
      });

      return hotels.length > 0 ? hotels[0] : null;
    } catch (error) {
      throw new SupabaseError('Failed to fetch hotel settings', error);
    }
  }

  /**
   * Update hotel settings
   */
  static async updateHotelSettings(id: number, updates: HotelUpdate): Promise<Hotel> {
    try {
      return await SupabaseAPI.update<Hotel>(this.TABLE, id, updates, {
        schema: hotelSchema
      });
    } catch (error) {
      throw new SupabaseError('Failed to update hotel settings', error);
    }
  }

  /**
   * Create new hotel (admin only)
   */
  static async createHotel(hotelData: HotelInsert): Promise<Hotel> {
    try {
      return await SupabaseAPI.create<Hotel>(this.TABLE, hotelData, {
        schema: hotelSchema
      });
    } catch (error) {
      throw new SupabaseError('Failed to create hotel', error);
    }
  }

  /**
   * Get hotel by ID
   */
  static async getHotelById(id: number): Promise<Hotel | null> {
    try {
      return await SupabaseAPI.getById<Hotel>(this.TABLE, id, {
        schema: hotelSchema
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch hotel by ID', error);
    }
  }

  /**
   * Get all hotels (for multi-hotel setups)
   */
  static async getAllHotels(): Promise<Hotel[]> {
    try {
      return await SupabaseAPI.get<Hotel>(this.TABLE, {
        schema: hotelSchema,
        orderBy: { column: 'created_at', ascending: false }
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch hotels', error);
    }
  }

  /**
   * Deactivate hotel (soft delete)
   */
  static async deactivateHotel(id: number): Promise<Hotel> {
    try {
      return await SupabaseAPI.update<Hotel>(this.TABLE, id, { 
        isActive: false 
      }, {
        schema: hotelSchema
      });
    } catch (error) {
      throw new SupabaseError('Failed to deactivate hotel', error);
    }
  }

  /**
   * Update specific hotel settings (partial update)
   */
  static async updateSettings(
    id: number, 
    settings: Partial<Hotel['settings']>
  ): Promise<Hotel> {
    try {
      // First get current hotel to merge settings
      const currentHotel = await this.getHotelById(id);
      if (!currentHotel) {
        throw new Error('Hotel not found');
      }

      const updatedSettings = {
        ...currentHotel.settings,
        ...settings
      };

      return await this.updateHotelSettings(id, { settings: updatedSettings });
    } catch (error) {
      throw new SupabaseError('Failed to update hotel settings', error);
    }
  }
}
