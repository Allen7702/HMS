//TODO: Import Hotel type from api package to maintain consistency
export interface Hotel {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  settings: {
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
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  hotel: Hotel | null;
  isLoading: boolean;
}
