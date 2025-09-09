import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Error handling utilities
export class SupabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public validationErrors: z.ZodError) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Enhanced CRUD operations with Zod validation
export class SupabaseAPI {
  static async get<T>(
    table: string,
    options: {
      schema?: z.ZodSchema<T>;
      select?: string;
      filters?: Record<string, any>;
      limit?: number;
      orderBy?: { column: string; ascending?: boolean };
    } = {}
  ): Promise<T[]> {
    try {
      const { schema, select = '*', filters, limit, orderBy } = options;
      let query = supabase.from(table).select(select);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new SupabaseError(`Failed to fetch ${table}`, error);
      }

      // Validate data with Zod if schema provided
      if (schema && data) {
        try {
          return data.map(item => schema.parse(item));
        } catch (validationError) {
          throw new ValidationError(
            `Data validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      return (data || []) as T[];
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new SupabaseError(`Database error while fetching ${table}`, error);
    }
  }

  static async getById<T>(
    table: string,
    id: number,
    options: {
      schema?: z.ZodSchema<T>;
      select?: string;
    } = {}
  ): Promise<T | null> {
    try {
      const { schema, select = '*' } = options;
      
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        throw new SupabaseError(`Failed to fetch ${table} by id`, error);
      }

      // Validate data with Zod if schema provided
      if (schema && data) {
        try {
          return schema.parse(data);
        } catch (validationError) {
          throw new ValidationError(
            `Data validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      return data as T;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new SupabaseError(`Database error while fetching ${table} by id`, error);
    }
  }

  static async create<T>(
    table: string,
    data: Record<string, any>,
    options: {
      schema?: z.ZodSchema<T>;
      validateInput?: z.ZodSchema<any>;
    } = {}
  ): Promise<T> {
    try {
      const { schema, validateInput } = options;

      // Validate input data if schema provided
      if (validateInput) {
        try {
          validateInput.parse(data);
        } catch (validationError) {
          throw new ValidationError(
            `Input validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new SupabaseError(`Failed to create ${table}`, error);
      }

      // Validate result with Zod if schema provided
      if (schema && result) {
        try {
          return schema.parse(result);
        } catch (validationError) {
          throw new ValidationError(
            `Result validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      return result as T;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new SupabaseError(`Database error while creating ${table}`, error);
    }
  }

  static async update<T>(
    table: string,
    id: number,
    updates: Record<string, any>,
    options: {
      schema?: z.ZodSchema<T>;
      validateInput?: z.ZodSchema<any>;
    } = {}
  ): Promise<T> {
    try {
      const { schema, validateInput } = options;

      // Validate input data if schema provided
      if (validateInput) {
        try {
          validateInput.parse(updates);
        } catch (validationError) {
          throw new ValidationError(
            `Input validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      const { data, error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new SupabaseError(`Failed to update ${table}`, error);
      }

      // Validate result with Zod if schema provided
      if (schema && data) {
        try {
          return schema.parse(data);
        } catch (validationError) {
          throw new ValidationError(
            `Result validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      return data as T;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new SupabaseError(`Database error while updating ${table}`, error);
    }
  }

  static async delete(table: string, id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        throw new SupabaseError(`Failed to delete ${table}`, error);
      }
    } catch (error) {
      throw new SupabaseError(`Database error while deleting ${table}`, error);
    }
  }

  static async search<T>(
    table: string,
    columns: string[],
    query: string,
    options: {
      schema?: z.ZodSchema<T>;
      select?: string;
      limit?: number;
    } = {}
  ): Promise<T[]> {
    try {
      const { schema, select = '*', limit = 10 } = options;
      
      const searchConditions = columns
        .map(col => `${col}.ilike.%${query}%`)
        .join(',');

      const { data, error } = await supabase
        .from(table)
        .select(select)
        .or(searchConditions)
        .limit(limit);

      if (error) {
        throw new SupabaseError(`Failed to search ${table}`, error);
      }

      // Validate data with Zod if schema provided
      if (schema && data) {
        try {
          return data.map(item => schema.parse(item));
        } catch (validationError) {
          throw new ValidationError(
            `Data validation failed for ${table}`, 
            validationError as z.ZodError
          );
        }
      }

      return (data || []) as T[];
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new SupabaseError(`Database error while searching ${table}`, error);
    }
  }
}

// Auth utilities
export class SupabaseAuth {
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw new SupabaseError('Failed to get current user', error);
      }

      return user;
    } catch (error) {
      throw new SupabaseError('Auth error while getting current user', error);
    }
  }

  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new SupabaseError('Failed to get current session', error);
      }

      return session;
    } catch (error) {
      throw new SupabaseError('Auth error while getting current session', error);
    }
  }

  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new SupabaseError('Failed to refresh session', error);
      }

      return data;
    } catch (error) {
      throw new SupabaseError('Auth error while refreshing session', error);
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new SupabaseError('Failed to sign in', error);
      }

      return data;
    } catch (error) {
      throw new SupabaseError('Auth error while signing in', error);
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new SupabaseError('Failed to sign out', error);
      }
    } catch (error) {
      throw new SupabaseError('Auth error while signing out', error);
    }
  }
}

// Storage utilities (for file uploads)
export class SupabaseStorage {
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);

      if (error) {
        throw new SupabaseError('Failed to upload file', error);
      }

      return data;
    } catch (error) {
      throw new SupabaseError('Storage error while uploading file', error);
    }
  }

  static async downloadFile(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        throw new SupabaseError('Failed to download file', error);
      }

      return data;
    } catch (error) {
      throw new SupabaseError('Storage error while downloading file', error);
    }
  }

  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
