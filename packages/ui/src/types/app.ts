export interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  settings: {
    currency: string;
    timezone: string;
    checkInTime: string;
    checkOutTime: string;
    maxAdvanceBookingDays: number;
  };
}

export interface AppSettings {
  hotel: Hotel | null;
  isLoading: boolean;
}
