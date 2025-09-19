import { SupabaseAPI, ValidationError, SupabaseError } from './supabase-api';
import { z } from 'zod';
import { guestSchema } from 'db';

export type Guest = z.infer<typeof guestSchema>;
export type GuestInsert = Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>;
export type GuestUpdate = Partial<GuestInsert>;

// Enhanced guest schemas with additional validation
const guestInsertSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().optional(),
  preferences: z.any().optional(),
  loyaltyPoints: z.number().min(0).default(0),
  loyaltyTier: z.enum(['None', 'Bronze', 'Silver', 'Gold']).default('None'),
  gdprConsent: z.boolean().default(false),
  userId: z.number().optional(),
});

 
const guestSearchFilters = z.object({
  query: z.string().optional(),
  loyaltyTier: z.enum(['None', 'Bronze', 'Silver', 'Gold']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(20),
});

export type GuestSearchFilters = {
  query?: string;
  loyaltyTier?: 'None' | 'Bronze' | 'Silver' | 'Gold';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export interface GuestSearchResult {
  guests: Guest[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export class GuestAPI {
  private static readonly TABLE = 'guests';

  /**
   * Get all guests with pagination and filtering
   */
  static async getGuests(filters: GuestSearchFilters = {}): Promise<GuestSearchResult> {
    try {
      const validated = guestSearchFilters.parse(filters);
      const { page, pageSize, query, loyaltyTier, dateFrom, dateTo } = validated;
      
      let queryFilters: Record<string, any> = {};
      
      if (loyaltyTier) {
        queryFilters.loyalty_tier = loyaltyTier;
      }
      
      if (dateFrom) {
        queryFilters.created_at = { gte: dateFrom };
      }
      
      if (dateTo) {
        queryFilters.created_at = { 
          ...queryFilters.created_at,
          lte: dateTo 
        };
      }

      // First, get all guests matching filters for total count
      const allRawGuests = await SupabaseAPI.get<any>(this.TABLE, {
        select: '*',
        filters: queryFilters,
        orderBy: { column: 'created_at', ascending: false },
      });

      const totalCount = allRawGuests.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;

      // Get paginated subset
      let rawGuests: any[] = [];
      
      if (query) {
        // Use search for text queries - this doesn't support pagination well, so filter after
        const searchResults = await SupabaseAPI.search<any>(
          this.TABLE,
          ['name', 'email', 'phone'],
          query,
          {
            limit: Math.max(pageSize * page, 100), // Get more results to account for pagination
          }
        );
        rawGuests = searchResults.slice(offset, offset + pageSize);
      } else {
        rawGuests = allRawGuests.slice(offset, offset + pageSize);
      }
      
      // Map database columns to TypeScript field names
      const guests = rawGuests.map((guest: any) => ({
        id: guest.id,
        fullName: guest.name,
        email: guest.email,
        phone: guest.phone,
        address: guest.address,
        idNumber: guest.id_number,
        nationality: guest.nationality,
        preferences: guest.preferences,
        loyaltyPoints: guest.loyalty_points,
        loyaltyTier: guest.loyalty_tier,
        gdprConsent: guest.gdpr_consent,
        createdAt: guest.created_at,
        updatedAt: guest.updated_at,
        userId: guest.user_id,
      }));

      return {
        guests,
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error('GuestAPI getGuests error:', error);
      throw new SupabaseError('Failed to fetch guests', error);
    }
  }

  /**
   * Get guest by ID
   */
  static async getGuestById(id: number): Promise<Guest | null> {
    try {
      const rawGuest = await SupabaseAPI.getById<any>(this.TABLE, id);
      
      if (!rawGuest) return null;
      
      // Map database columns to TypeScript field names
      return {
        id: rawGuest.id,
        fullName: rawGuest.name,
        email: rawGuest.email,
        phone: rawGuest.phone,
        address: rawGuest.address,
        idNumber: rawGuest.id_number,
        nationality: rawGuest.nationality,
        preferences: rawGuest.preferences,
        loyaltyPoints: rawGuest.loyalty_points,
        loyaltyTier: rawGuest.loyalty_tier,
        gdprConsent: rawGuest.gdpr_consent,
        createdAt: rawGuest.created_at,
        updatedAt: rawGuest.updated_at,
        userId: rawGuest.user_id,
      };
    } catch (error) {
      throw new SupabaseError('Failed to fetch guest by ID', error);
    }
  }

  /**
   * Create new guest
   */
  static async createGuest(guestData: GuestInsert): Promise<Guest> {
    try {
      // Map TypeScript field names to database column names
      const dbData = {
        name: guestData.fullName,
        email: guestData.email,
        phone: guestData.phone,
        address: guestData.address,
        id_number: guestData.idNumber,
        nationality: guestData.nationality,
        preferences: guestData.preferences,
        loyalty_points: guestData.loyaltyPoints,
        loyalty_tier: guestData.loyaltyTier,
        gdpr_consent: guestData.gdprConsent,
        user_id: guestData.userId,
      };

      const result = await SupabaseAPI.create<any>(this.TABLE, dbData);
      
      // Map database column names back to TypeScript field names
      return {
        id: result.id,
        fullName: result.name,
        email: result.email,
        phone: result.phone,
        address: result.address,
        idNumber: result.id_number,
        nationality: result.nationality,
        preferences: result.preferences,
        loyaltyPoints: result.loyalty_points,
        loyaltyTier: result.loyalty_tier,
        gdprConsent: result.gdpr_consent,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        userId: result.user_id,
      };
    } catch (error) {
      throw new SupabaseError('Failed to create guest', error);
    }
  }

  /**
   * Update guest
   */
  static async updateGuest(id: number, updates: GuestUpdate): Promise<Guest> {
    try {
      // Map TypeScript field names to database column names
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.name = updates.fullName;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
      if (updates.nationality !== undefined) dbUpdates.nationality = updates.nationality;
      if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;
      if (updates.loyaltyPoints !== undefined) dbUpdates.loyalty_points = updates.loyaltyPoints;
      if (updates.loyaltyTier !== undefined) dbUpdates.loyalty_tier = updates.loyaltyTier;
      if (updates.gdprConsent !== undefined) dbUpdates.gdpr_consent = updates.gdprConsent;
      if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;

      const result = await SupabaseAPI.update<any>(this.TABLE, id, dbUpdates);
      
      // Map database column names back to TypeScript field names
      return {
        id: result.id,
        fullName: result.name,
        email: result.email,
        phone: result.phone,
        address: result.address,
        idNumber: result.id_number,
        nationality: result.nationality,
        preferences: result.preferences,
        loyaltyPoints: result.loyalty_points,
        loyaltyTier: result.loyalty_tier,
        gdprConsent: result.gdpr_consent,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        userId: result.user_id,
      };
    } catch (error) {
      throw new SupabaseError('Failed to update guest', error);
    }
  }

  /**
   * Delete guest (soft delete by deactivating)
   */
  static async deleteGuest(id: number): Promise<void> {
    try {
      await SupabaseAPI.delete(this.TABLE, id);
    } catch (error) {
      throw new SupabaseError('Failed to delete guest', error);
    }
  }

  /**
   * Search guests by name, email, or phone
   */
  static async searchGuests(query: string, limit = 10): Promise<Guest[]> {
    try {
      return await SupabaseAPI.search<Guest>(
        this.TABLE,
        ['full_name', 'email', 'phone'],
        query,
        {
          schema: guestSchema,
          limit,
        }
      );
    } catch (error) {
      throw new SupabaseError('Failed to search guests', error);
    }
  }

  /**
   * Get guest by email
   */
  static async getGuestByEmail(email: string): Promise<Guest | null> {
    try {
      const guests = await SupabaseAPI.get<Guest>(this.TABLE, {
        schema: guestSchema,
        filters: { email },
        limit: 1,
      });

      return guests.length > 0 ? guests[0] : null;
    } catch (error) {
      throw new SupabaseError('Failed to fetch guest by email', error);
    }
  }

  /**
   * Update guest loyalty points
   */
  static async updateLoyaltyPoints(id: number, points: number): Promise<Guest> {
    try {
      const guest = await this.getGuestById(id);
      if (!guest) {
        throw new Error('Guest not found');
      }

      const newPoints = (guest.loyaltyPoints || 0) + points;
      let newTier = guest.loyaltyTier || 'None';

      // Update tier based on points
      if (newPoints >= 1000) newTier = 'Gold';
      else if (newPoints >= 500) newTier = 'Silver';
      else if (newPoints >= 100) newTier = 'Bronze';
      else newTier = 'None';

      return await this.updateGuest(id, {
        loyaltyPoints: newPoints,
        loyaltyTier: newTier as any,
      });
    } catch (error) {
      throw new SupabaseError('Failed to update loyalty points', error);
    }
  }

}
