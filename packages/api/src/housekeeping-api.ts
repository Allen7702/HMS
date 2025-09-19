import { SupabaseAPI, ValidationError, SupabaseError, supabase } from './supabase-api';
import { 
  Housekeeping as BaseHousekeeping, 
  HousekeepingInsert as BaseHousekeepingInsert, 
  HousekeepingUpdate as BaseHousekeepingUpdate,
  housekeepingSchema,
  housekeepingInsertSchema,
  housekeepingUpdateSchema
} from 'db';

// Extended interface with joined data for API responses
export interface Housekeeping extends BaseHousekeeping {
  // Joined data from relations
  room?: {
    id: number;
    number: string | null;
    type: string | null;
  };
  assignee?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Use the base types for inserts and updates
export type HousekeepingInsert = BaseHousekeepingInsert;
export type HousekeepingUpdate = BaseHousekeepingUpdate;

export class HousekeepingAPI {
  private static readonly TABLE = 'housekeepings';

  /**
   * Get all housekeeping tasks with optional filtering
   */
  static async getHousekeepingTasks(filters?: {
    status?: string;
    assigneeId?: number;
    roomId?: number;
    scheduledDate?: string;
  }): Promise<Housekeeping[]> {
    try {
      let query = supabase
        .from(this.TABLE)
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId);
      }
      if (filters?.roomId) {
        query = query.eq('room_id', filters.roomId);
      }
      if (filters?.scheduledDate) {
        query = query.gte('scheduled_date', filters.scheduledDate);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToType);
    } catch (error) {
      throw new SupabaseError('Failed to fetch housekeeping tasks', error);
    }
  }

  /**
   * Get housekeeping task by ID
   */
  static async getHousekeepingById(id: number): Promise<Housekeeping | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE)
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw error;
      }
      if (!data) return null;

      return this.mapDatabaseToType(data);
    } catch (error) {
      throw new SupabaseError('Failed to fetch housekeeping task', error);
    }
  }

  /**
   * Create new housekeeping task
   */
  static async createHousekeepingTask(task: HousekeepingInsert): Promise<Housekeeping> {
    try {
      // Validate input data
      const validatedTask = housekeepingInsertSchema.parse(task);

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          room_id: validatedTask.roomId,
          status: validatedTask.status,
          assignee_id: validatedTask.assigneeId,
          scheduled_date: validatedTask.scheduledDate,
          completed_at: validatedTask.completedAt,
          notes: validatedTask.notes,
        })
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      return this.mapDatabaseToType(data);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        throw new ValidationError('Invalid housekeeping task data', error as any);
      }
      throw new SupabaseError('Failed to create housekeeping task', error);
    }
  }

  /**
   * Update housekeeping task
   */
  static async updateHousekeepingTask(id: number, updates: HousekeepingUpdate): Promise<Housekeeping> {
    try {
      // Validate input data
      const validatedUpdates = housekeepingUpdateSchema.parse(updates);
      
      const updateData: any = {};
      
      if (validatedUpdates.roomId !== undefined) updateData.room_id = validatedUpdates.roomId;
      if (validatedUpdates.status !== undefined) updateData.status = validatedUpdates.status;
      if (validatedUpdates.assigneeId !== undefined) updateData.assignee_id = validatedUpdates.assigneeId;
      if (validatedUpdates.scheduledDate !== undefined) updateData.scheduled_date = validatedUpdates.scheduledDate;
      if (validatedUpdates.completedAt !== undefined) updateData.completed_at = validatedUpdates.completedAt;
      if (validatedUpdates.notes !== undefined) updateData.notes = validatedUpdates.notes;

      // If status is being set to completed, set completed_at
      if (validatedUpdates.status === 'Completed' && !validatedUpdates.completedAt) {
        updateData.completed_at = new Date();
      }

      const { data, error } = await supabase
        .from(this.TABLE)
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      return this.mapDatabaseToType(data);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        throw new ValidationError('Invalid housekeeping update data', error as any);
      }
      throw new SupabaseError('Failed to update housekeeping task', error);
    }
  }

  /**
   * Delete housekeeping task
   */
  static async deleteHousekeepingTask(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseError('Failed to delete housekeeping task', error);
    }
  }

  /**
   * Get housekeeping statistics
   */
  static async getHousekeepingStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE)
        .select('status, scheduled_date');

      if (error) throw error;

      const now = new Date();
      const stats = {
        total: data?.length || 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
      };

      data?.forEach((task: any) => {
        switch (task.status) {
          case 'Pending':
            stats.pending++;
            if (task.scheduled_date && new Date(task.scheduled_date) < now) {
              stats.overdue++;
            }
            break;
          case 'In Progress':
            stats.inProgress++;
            break;
          case 'Completed':
            stats.completed++;
            break;
        }
      });

      return stats;
    } catch (error) {
      throw new SupabaseError('Failed to fetch housekeeping statistics', error);
    }
  }

  /**
   * Get tasks by assignee
   */
  static async getTasksByAssignee(assigneeId: number): Promise<Housekeeping[]> {
    return this.getHousekeepingTasks({ assigneeId });
  }

  /**
   * Get tasks by room
   */
  static async getTasksByRoom(roomId: number): Promise<Housekeeping[]> {
    return this.getHousekeepingTasks({ roomId });
  }

  /**
   * Mark task as completed
   */
  static async completeTask(id: number, notes?: string): Promise<Housekeeping> {
    return this.updateHousekeepingTask(id, {
      status: 'Completed',
      completedAt: new Date(),
      notes: notes || undefined,
    });
  }

  /**
   * Assign task to user
   */
  static async assignTask(id: number, assigneeId: number): Promise<Housekeeping> {
    return this.updateHousekeepingTask(id, {
      assigneeId,
      status: 'In Progress',
    });
  }

  /**
   * Bulk update task statuses
   */
  static async bulkUpdateStatus(ids: number[], status: 'Pending' | 'In Progress' | 'Completed'): Promise<Housekeeping[]> {
    try {
      const updateData: any = { status };
      
      // If completing tasks, set completed_at
      if (status === 'Completed') {
        updateData.completed_at = new Date();
      }

      const { data, error } = await supabase
        .from(this.TABLE)
        .update(updateData)
        .in('id', ids)
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `);

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToType);
    } catch (error) {
      throw new SupabaseError('Failed to bulk update task statuses', error);
    }
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(): Promise<Housekeeping[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from(this.TABLE)
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `)
        .neq('status', 'Completed')
        .lt('scheduled_date', now)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToType);
    } catch (error) {
      throw new SupabaseError('Failed to fetch overdue tasks', error);
    }
  }

  /**
   * Get tasks due today
   */
  static async getTasksDueToday(): Promise<Housekeeping[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      const { data, error } = await supabase
        .from(this.TABLE)
        .select(`
          *,
          room:rooms!room_id(id, number, type),
          assignee:users!assignee_id(id, first_name, last_name, email)
        `)
        .gte('scheduled_date', startOfDay)
        .lt('scheduled_date', endOfDay)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToType);
    } catch (error) {
      throw new SupabaseError('Failed to fetch tasks due today', error);
    }
  }

  /**
   * Map database record to TypeScript type
   */
  private static mapDatabaseToType(data: any): Housekeeping {
    return {
      id: data.id,
      roomId: data.room_id || null,
      status: data.status,
      assigneeId: data.assignee_id || null,
      scheduledDate: data.scheduled_date || null,
      completedAt: data.completed_at || null,
      notes: data.notes || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      room: data.room ? {
        id: data.room.id,
        number: data.room.number || null,
        type: data.room.type || null,
      } : undefined,
      assignee: data.assignee ? {
        id: data.assignee.id,
        firstName: data.assignee.first_name || null,
        lastName: data.assignee.last_name || null,
        email: data.assignee.email,
      } : undefined,
    };
  }
}
