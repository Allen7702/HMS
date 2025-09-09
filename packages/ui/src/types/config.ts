// Environment variables types
export interface EnvironmentConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  DATABASE_URL?: string;
  WEBSOCKET_URL?: string;
}

// Application configuration
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  websocket: {
    url: string;
    reconnectAttempts: number;
  };
  hotel: {
    defaultCheckInTime: string;
    defaultCheckOutTime: string;
    maxAdvanceBookingDays: number;
    currency: string;
    timezone: string;
  };
}

// Default configuration
export const defaultConfig: AppConfig = {
  supabase: {
    url: 'http://127.0.0.1:54321',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  },
  websocket: {
    url: 'ws://localhost:3001/ws',
    reconnectAttempts: 5,
  },
  hotel: {
    defaultCheckInTime: '15:00',
    defaultCheckOutTime: '11:00',
    maxAdvanceBookingDays: 365,
    currency: 'USD',
    timezone: 'UTC',
  },
};
