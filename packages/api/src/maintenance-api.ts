import { SupabaseAPI, ValidationError, SupabaseError, supabase } from './supabase-api';
import { 
  Maintenance as BaseMaintenance, 
  MaintenanceInsert as BaseMaintenanceInsert, 
  MaintenanceUpdate as BaseMaintenanceUpdate,
  maintenanceSchema,
  maintenanceInsertSchema,
  maintenanceUpdateSchema
} from 'db';

// Extended interface with joined data for API responses
export interface Maintenance extends BaseMaintenance {
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
export type MaintenanceInsert = BaseMaintenanceInsert;
export type MaintenanceUpdate = BaseMaintenanceUpdate;

// History entry type for maintenance history tracking
export interface MaintenanceHistoryEntry {
  timestamp: string;
  action: string;
  details: string;
  userId?: number;
  userName?: string;
}

export class MaintenanceAPI {
  private static readonly TABLE = 'maintenances';

  /**
   * Get all maintenance requests with optional filtering
   */
  static async getMaintenanceRequests(filters?: {
    status?: string;
    priority?: string;
    assigneeId?: number;
    roomId?: number;
  }): Promise<Maintenance[]> {
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
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId);
      }
      if (filters?.roomId) {
        query = query.eq('room_id', filters.roomId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToType);
    } catch (error) {
      throw new SupabaseError('Failed to fetch maintenance requests', error);
    }
  }

  /**
   * Get maintenance request by ID
   */
  static async getMaintenanceById(id: number): Promise<Maintenance | null> {
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
      throw new SupabaseError('Failed to fetch maintenance request', error);
    }
  }

  /**
   * Create new maintenance request
   */
  static async createMaintenanceRequest(request: MaintenanceInsert): Promise<Maintenance> {
    try {
      // Validate input data
      const validatedRequest = maintenanceInsertSchema.parse(request);

      // Initialize history
      const initialHistory: MaintenanceHistoryEntry[] = [{
        timestamp: new Date().toISOString(),
        action: 'Created',
        details: 'Maintenance request created',
      }];

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          room_id: validatedRequest.roomId,
          description: validatedRequest.description,
          status: validatedRequest.status,
          priority: validatedRequest.priority,
          assignee_id: validatedRequest.assigneeId,
          history: initialHistory,
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
        throw new ValidationError('Invalid maintenance request data', error as any);
      }
      throw new SupabaseError('Failed to create maintenance request', error);
    }
  }

  /**
   * Update maintenance request
   */
  static async updateMaintenanceRequest(id: number, updates: MaintenanceUpdate, userId?: number, userName?: string): Promise<Maintenance> {
    try {
      // Validate input data
      const validatedUpdates = maintenanceUpdateSchema.parse(updates);
      
      // Get current maintenance request to update history
      const current = await this.getMaintenanceById(id);
      if (!current) {
        throw new Error('Maintenance request not found');
      }

      const updateData: any = {};
      const historyEntries: MaintenanceHistoryEntry[] = Array.isArray(current.history) ? [...current.history] : [];
      
      if (validatedUpdates.roomId !== undefined) {
        updateData.room_id = validatedUpdates.roomId;
        historyEntries.push({
          timestamp: new Date().toISOString(),
          action: 'Room Changed',
          details: `Room changed to ${validatedUpdates.roomId}`,
          userId,
          userName,
        });
      }
      
      if (validatedUpdates.description !== undefined) {
        updateData.description = validatedUpdates.description;
        historyEntries.push({
          timestamp: new Date().toISOString(),
          action: 'Description Updated',
          details: 'Description was updated',
          userId,
          userName,
        });
      }
      
      if (validatedUpdates.status !== undefined) {
        updateData.status = validatedUpdates.status;
        historyEntries.push({
          timestamp: new Date().toISOString(),
          action: 'Status Changed',
          details: `Status changed to ${validatedUpdates.status}`,
          userId,
          userName,
        });
      }
      
      if (validatedUpdates.priority !== undefined) {
        updateData.priority = validatedUpdates.priority;
        historyEntries.push({
          timestamp: new Date().toISOString(),
          action: 'Priority Changed',
          details: `Priority changed to ${validatedUpdates.priority}`,
          userId,
          userName,
        });
      }
      
      if (validatedUpdates.assigneeId !== undefined) {
        updateData.assignee_id = validatedUpdates.assigneeId;
        historyEntries.push({
          timestamp: new Date().toISOString(),
          action: 'Assignee Changed',
          details: `Assignee changed`,
          userId,
          userName,
        });
      }

      // Update history
      updateData.history = historyEntries;

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
        throw new ValidationError('Invalid maintenance update data', error as any);
      }
      throw new SupabaseError('Failed to update maintenance request', error);
    }
  }

  /**
   * Delete maintenance request
   */
  static async deleteMaintenanceRequest(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseError('Failed to delete maintenance request', error);
    }
  }

  /**
   * Get maintenance statistics
   */
  static async getMaintenanceStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE)
        .select('status, priority');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
      };

      data?.forEach((request: any) => {
        // Count by status
        switch (request.status) {
          case 'Open':
            stats.open++;
            break;
          case 'In Progress':
            stats.inProgress++;
            break;
          case 'Resolved':
            stats.resolved++;
            break;
        }

        // Count by priority
        switch (request.priority) {
          case 'High':
            stats.highPriority++;
            break;
          case 'Medium':
            stats.mediumPriority++;
            break;
          case 'Low':
            stats.lowPriority++;
            break;
        }
      });

      return stats;
    } catch (error) {
      throw new SupabaseError('Failed to fetch maintenance statistics', error);
    }
  }

  /**
   * Get requests by assignee
   */
  static async getRequestsByAssignee(assigneeId: number): Promise<Maintenance[]> {
    return this.getMaintenanceRequests({ assigneeId });
  }

  /**
   * Get requests by room
   */
  static async getRequestsByRoom(roomId: number): Promise<Maintenance[]> {
    return this.getMaintenanceRequests({ roomId });
  }

  /**
   * Assign request to user
   */
  static async assignRequest(id: number, assigneeId: number, userId?: number, userName?: string): Promise<Maintenance> {
    return this.updateMaintenanceRequest(id, {
      assigneeId,
      status: 'In Progress',
    }, userId, userName);
  }

  /**
   * Resolve maintenance request
   */
  static async resolveRequest(id: number, userId?: number, userName?: string): Promise<Maintenance> {
    return this.updateMaintenanceRequest(id, {
      status: 'Resolved',
    }, userId, userName);
  }

  /**
   * Add history entry to maintenance request
   */
  static async addHistoryEntry(id: number, action: string, details: string, userId?: number, userName?: string): Promise<Maintenance> {
    try {
      const current = await this.getMaintenanceById(id);
      if (!current) {
        throw new Error('Maintenance request not found');
      }

      const historyEntries: MaintenanceHistoryEntry[] = Array.isArray(current.history) ? [...current.history] : [];
      historyEntries.push({
        timestamp: new Date().toISOString(),
        action,
        details,
        userId,
        userName,
      });

      const { data, error } = await supabase
        .from(this.TABLE)
        .update({ history: historyEntries })
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
      throw new SupabaseError('Failed to add history entry', error);
    }
  }

  /**
   * Get high priority open requests
   */
  static async getHighPriorityRequests(): Promise<Maintenance[]> {
    return this.getMaintenanceRequests({ priority: 'High', status: 'Open' });
  }

  /**
   * Bulk update request statuses
   */
  static async bulkUpdateStatus(ids: number[], status: 'Open' | 'In Progress' | 'Resolved', userId?: number, userName?: string): Promise<Maintenance[]> {
    try {
      const results: Maintenance[] = [];
      
      // Update each request individually to maintain proper history
      for (const id of ids) {
        const updated = await this.updateMaintenanceRequest(id, { status }, userId, userName);
        results.push(updated);
      }

      return results;
    } catch (error) {
      throw new SupabaseError('Failed to bulk update request statuses', error);
    }
  }

  /**
   * Map database record to TypeScript type
   */
  private static mapDatabaseToType(data: any): Maintenance {
    return {
      id: data.id,
      roomId: data.room_id || null,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assignee_id || null,
      history: data.history || null,
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
