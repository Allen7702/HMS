// Re-export all types from the database package (Single Source of Truth)
export type {
    // User types (has separate Select/Insert/Update)
    UserSelect,
    UserInsert,
    UserUpdate,
    // Simplified single types for other entities
    Guest,
    Room,
    RoomType,
    Booking,
    Payment,
    Invoice,
    Housekeeping,
    Maintenance,
    Notification,
    AuditLog,
    OtaReservation,
} from 'db';

import type { UserSelect } from 'db';

// Safe user type without password for client-side use
export type SafeUser = Omit<UserSelect, 'password'>;

// Type aliases for backward compatibility (converting snake_case to camelCase)
import type { 
    Guest as DbGuest, 
    Room as DbRoom, 
    RoomType as DbRoomType, 
    Booking as DbBooking 
} from 'db';

// Create camelCase versions for existing code compatibility
export type GuestCompat = Omit<DbGuest, 'name' | 'loyalty_points' | 'loyalty_tier' | 'gdpr_consent' | 'created_at' | 'updated_at' | 'user_id'> & {
    fullName: string;
    loyaltyPoints: number | null;
    loyaltyTier: 'None' | 'Bronze' | 'Silver' | 'Gold' | null;
    gdprConsent: boolean | null;
    createdAt: string | null;
    updatedAt: string | null;
    // userId is omitted completely for backward compatibility
};

export type RoomCompat = Omit<DbRoom, 'room_number' | 'room_type_id' | 'last_cleaned' | 'created_at' | 'updated_at'> & {
    roomNumber: string;
    roomTypeId: number | null;
    lastCleaned: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type RoomTypeCompat = Omit<DbRoomType, 'price_modifier'> & {
    priceModifier: number | null;
};

export type BookingCompat = Omit<DbBooking, 'guest_id' | 'room_id' | 'check_in' | 'check_out' | 'rate_applied' | 'created_at' | 'updated_at'> & {
    guestId: number | null;
    roomId: number | null;
    checkIn: string;
    checkOut: string;
    rateApplied: number;
    createdAt: string | null;
    updatedAt: string | null;
    guest?: GuestCompat;
    room?: RoomCompat;
};

// For the UI package, we'll use the extended booking type
export type BookingWithRelations = DbBooking & {
    guest?: DbGuest;
    room?: DbRoom;
};

export interface AuthState {
    user: SafeUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
}

export interface NotificationItem {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface AppNotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
}

export interface Hotel {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
    amenities: string[];
    checkInTime: string;
    checkOutTime: string;
    currency: string;
    timezone: string;
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
        desktop: boolean;
        email: boolean;
        sms: boolean;
    };
    autoSave: boolean;
    defaultView: 'dashboard' | 'rooms' | 'bookings';
}
