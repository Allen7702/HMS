import { SupabaseAPI, ValidationError, SupabaseError } from './supabase-api';
import {
  Hotel,
  HotelInsert,
  HotelUpdate,
  hotelSchema
} from 'db';

// Extract the settings type from the Hotel type
type HotelSettings = Hotel['settings'];

export class HotelAPI {
  private static readonly TABLE = 'hotels';

  /**
   * Get the active hotel settings (assuming single hotel setup)
   */
  static async getHotelSettings(): Promise<Hotel | null> {
    try {
      const rawHotels = await SupabaseAPI.get<any>(this.TABLE, {
        filters: { is_active: true },
        limit: 1,
        orderBy: { column: 'created_at', ascending: false }
      });

      if (rawHotels.length === 0) return null;

      const rawHotel = rawHotels[0];

      // Map database columns to TypeScript field names
      return {
        id: rawHotel.id,
        name: rawHotel.name,
        address: rawHotel.address,
        phone: rawHotel.phone,
        email: rawHotel.email,
        website: rawHotel.website,
        description: rawHotel.description,
        settings: rawHotel.settings,
        isActive: rawHotel.is_active,
        createdAt: rawHotel.created_at,
        updatedAt: rawHotel.updated_at,
      };
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
    settings: Partial<HotelSettings>
  ): Promise<Hotel> {
    try {
      // First get current hotel to merge settings
      const currentHotel = await this.getHotelById(id);
      if (!currentHotel) {
        throw new Error('Hotel not found');
      }

      // Ensure current settings is an object and merge safely
      const currentSettings = (currentHotel.settings as HotelSettings) || {} as HotelSettings;
      const updatedSettings: HotelSettings = Object.assign({}, currentSettings, settings) as HotelSettings;

      return await this.updateHotelSettings(id, { settings: updatedSettings });
    } catch (error) {
      throw new SupabaseError('Failed to update hotel settings', error);
    }
  }
}
