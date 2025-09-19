import { SupabaseAPI, ValidationError, SupabaseError } from './supabase-api';
import { z } from 'zod';
import { roomSchema, roomTypeSchema } from 'db';

export type Room = z.infer<typeof roomSchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;
export type RoomInsert = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>;
export type RoomUpdate = Partial<RoomInsert>;
export type RoomTypeInsert = Omit<RoomType, 'id'>;
export type RoomTypeUpdate = Partial<RoomTypeInsert>;

// Enhanced room schemas with additional validation
const roomInsertSchema = z.object({
  number: z.string().min(1, 'Room number is required'),
  roomTypeId: z.number().min(1, 'Room type ID is required'),
  status: z.enum(['Available', 'Occupied', 'Maintenance', 'Dirty']),
  floor: z.number().min(0, 'Floor must be non-negative'),
  amenities: z.array(z.string()).optional().default([]),
  maxOccupancy: z.number().min(1, 'Max occupancy must be at least 1'),
  notes: z.string().optional(),
});

const roomUpdateSchema = roomInsertSchema.partial();

const roomTypeInsertSchema = z.object({
  name: z.string().min(1, 'Room type name is required'),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  priceModifier: z.number().optional(),
});

const roomTypeUpdateSchema = roomTypeInsertSchema.partial();

const roomSearchFilters = z.object({
  query: z.string().optional(),
  status: z.enum(['Available', 'Occupied', 'Maintenance', 'Dirty']).optional(),
  roomTypeId: z.number().optional(),
  floor: z.number().optional(),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(20),
});

export type RoomSearchFilters = z.infer<typeof roomSearchFilters>;

export interface RoomSearchResult {
  rooms: Room[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface RoomWithType extends Room {
  roomType?: RoomType;
}

export class RoomAPI {
  private static readonly TABLE = 'rooms';
  private static readonly ROOM_TYPE_TABLE = 'room_types';

  /**
   * Get all rooms with pagination and filtering
   */
  static async getRooms(filters: Partial<RoomSearchFilters> = {}): Promise<RoomSearchResult> {
    try {
      const validated = roomSearchFilters.parse(filters);
      const { page, pageSize, query, status, roomTypeId, floor } = validated;
      
      let queryFilters: Record<string, any> = {};
      
      if (status) {
        queryFilters.status = status;
      }
      
      if (roomTypeId) {
        queryFilters.room_type_id = roomTypeId;
      }
      
      if (floor !== undefined) {
        queryFilters.floor = floor;
      }

      // Get total count for pagination
      const totalRooms = await SupabaseAPI.get<Room>(this.TABLE, {
        schema: roomSchema,
        select: 'id',
        filters: queryFilters,
      });

      const totalCount = totalRooms.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;

      // Get paginated rooms
      let rooms: Room[] = [];
      
      if (query) {
        // Use search for text queries (room number)
        rooms = await SupabaseAPI.search<Room>(
          this.TABLE,
          ['number', 'notes'],
          query,
          {
            schema: roomSchema,
            limit: pageSize,
          }
        );
      } else {
        rooms = await SupabaseAPI.get<Room>(this.TABLE, {
          schema: roomSchema,
          filters: queryFilters,
          limit: pageSize,
          orderBy: { column: 'number', ascending: true },
        });
      }

      return {
        rooms: rooms.slice(offset, offset + pageSize),
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new SupabaseError('Failed to fetch rooms', error);
    }
  }

  /**
   * Get rooms with room type details
   */
  static async getRoomsWithTypes(filters: Partial<RoomSearchFilters> = {}): Promise<{
    rooms: RoomWithType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const result = await this.getRooms(filters);
      
      const roomsWithTypes: RoomWithType[] = await Promise.all(
        result.rooms.map(async (room) => {
          const roomType = room.roomTypeId ? await this.getRoomTypeById(room.roomTypeId) : undefined;
          return {
            ...room,
            roomType: roomType || undefined,
          };
        })
      );

      return {
        rooms: roomsWithTypes,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    } catch (error) {
      throw new SupabaseError('Failed to fetch rooms with types', error);
    }
  }

  /**
   * Get room by ID
   */
  static async getRoomById(id: number): Promise<Room | null> {
    try {
      return await SupabaseAPI.getById<Room>(this.TABLE, id, {
        schema: roomSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch room by ID', error);
    }
  }

  /**
   * Create new room
   */
  static async createRoom(roomData: RoomInsert): Promise<Room> {
    try {
      return await SupabaseAPI.create<Room>(this.TABLE, roomData, {
        schema: roomSchema,
        validateInput: roomInsertSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to create room', error);
    }
  }

  /**
   * Update room
   */
  static async updateRoom(id: number, updates: RoomUpdate): Promise<Room> {
    try {
      return await SupabaseAPI.update<Room>(this.TABLE, id, updates, {
        schema: roomSchema,
        validateInput: roomUpdateSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to update room', error);
    }
  }

  /**
   * Update room status
   */
  static async updateRoomStatus(id: number, status: Room['status']): Promise<Room> {
    try {
      return await this.updateRoom(id, { status });
    } catch (error) {
      throw new SupabaseError('Failed to update room status', error);
    }
  }

  /**
   * Delete room
   */
  static async deleteRoom(id: number): Promise<void> {
    try {
      await SupabaseAPI.delete(this.TABLE, id);
    } catch (error) {
      throw new SupabaseError('Failed to delete room', error);
    }
  }

  /**
   * Get available rooms for date range
   */
  static async getAvailableRooms(checkIn: Date, checkOut: Date): Promise<Room[]> {
    try {
      // Get all available rooms
      const availableRooms = await SupabaseAPI.get<Room>(this.TABLE, {
        schema: roomSchema,
        filters: { status: 'Available' },
        orderBy: { column: 'number', ascending: true },
      });

      // TODO: Filter out rooms with conflicting bookings
      // This would require checking against bookings table
      // For now, return all available rooms
      return availableRooms;
    } catch (error) {
      throw new SupabaseError('Failed to fetch available rooms', error);
    }
  }

  /**
   * Get rooms by floor
   */
  static async getRoomsByFloor(floor: number): Promise<Room[]> {
    try {
      return await SupabaseAPI.get<Room>(this.TABLE, {
        schema: roomSchema,
        filters: { floor },
        orderBy: { column: 'number', ascending: true },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch rooms by floor', error);
    }
  }

  /**
   * Get room occupancy statistics
   */
  static async getRoomOccupancyStats(): Promise<{
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    dirty: number;
  }> {
    try {
      const allRooms = await SupabaseAPI.get<Room>(this.TABLE, {
        schema: roomSchema,
      });

      const stats = {
        total: allRooms.length,
        available: allRooms.filter(r => r.status === 'Available').length,
        occupied: allRooms.filter(r => r.status === 'Occupied').length,
        maintenance: allRooms.filter(r => r.status === 'Maintenance').length,
        dirty: allRooms.filter(r => r.status === 'Dirty').length,
      };

      return stats;
    } catch (error) {
      throw new SupabaseError('Failed to fetch room occupancy stats', error);
    }
  }

  // Room Type Management

  /**
   * Get all room types
   */
  static async getRoomTypes(): Promise<RoomType[]> {
    try {
      return await SupabaseAPI.get<RoomType>(this.ROOM_TYPE_TABLE, {
        schema: roomTypeSchema,
        orderBy: { column: 'name', ascending: true },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch room types', error);
    }
  }

  /**
   * Get room type by ID
   */
  static async getRoomTypeById(id: number): Promise<RoomType | null> {
    try {
      return await SupabaseAPI.getById<RoomType>(this.ROOM_TYPE_TABLE, id, {
        schema: roomTypeSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch room type by ID', error);
    }
  }

  /**
   * Create new room type
   */
  static async createRoomType(roomTypeData: RoomTypeInsert): Promise<RoomType> {
    try {
      return await SupabaseAPI.create<RoomType>(this.ROOM_TYPE_TABLE, roomTypeData, {
        schema: roomTypeSchema,
        validateInput: roomTypeInsertSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to create room type', error);
    }
  }

  /**
   * Update room type
   */
  static async updateRoomType(id: number, updates: RoomTypeUpdate): Promise<RoomType> {
    try {
      return await SupabaseAPI.update<RoomType>(this.ROOM_TYPE_TABLE, id, updates, {
        schema: roomTypeSchema,
        validateInput: roomTypeUpdateSchema,
      });
    } catch (error) {
      throw new SupabaseError('Failed to update room type', error);
    }
  }

  /**
   * Delete room type
   */
  static async deleteRoomType(id: number): Promise<void> {
    try {
      await SupabaseAPI.delete(this.ROOM_TYPE_TABLE, id);
    } catch (error) {
      throw new SupabaseError('Failed to delete room type', error);
    }
  }

  /**
   * Get rooms by room type
   */
  static async getRoomsByType(roomTypeId: number): Promise<Room[]> {
    try {
      return await SupabaseAPI.get<Room>(this.TABLE, {
        schema: roomSchema,
        filters: { room_type_id: roomTypeId },
        orderBy: { column: 'number', ascending: true },
      });
    } catch (error) {
      throw new SupabaseError('Failed to fetch rooms by type', error);
    }
  }
}
