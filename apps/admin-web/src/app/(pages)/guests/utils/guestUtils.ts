import type { Guest } from 'db';
import { GUEST_STATUSES, BOOKING_STATUSES, LOYALTY_TIERS } from '../constants';

// Helper function to determine guest status based on real booking data
export function getGuestStatus(guest: any, bookings: any[] = []): string {
  const validBookings = Array.isArray(bookings) ? bookings : [];
  const guestBookings = validBookings.filter((booking: any) => {
    const guestId = booking.guestId || booking.guest_id;
    return guestId === guest.id;
  });
  
  // Check if guest has current booking (checked in)
  const hasCurrentBooking = guestBookings.some((booking: any) => booking.status === BOOKING_STATUSES.CHECKED_IN);
  if (hasCurrentBooking) return GUEST_STATUSES.CHECKED_IN;
  
  // Check if guest has upcoming booking
  const today = new Date();
  const hasUpcomingBooking = guestBookings.some((booking: any) => {
    const checkIn = new Date(booking.checkIn || booking.check_in);
    return booking.status === BOOKING_STATUSES.CONFIRMED && checkIn >= today;
  });
  if (hasUpcomingBooking) return GUEST_STATUSES.UPCOMING;
  
  // Otherwise, past guest or no bookings
  return guestBookings.length > 0 ? GUEST_STATUSES.PAST_GUEST : GUEST_STATUSES.NO_BOOKINGS;
}

// Helper function to get room and date info based on real booking data
export function getRoomInfo(guest: any, status: string, bookings: any[] = []) {
  const validBookings = Array.isArray(bookings) ? bookings : [];
  const guestBookings = validBookings.filter((booking: any) => {
    const guestId = booking.guestId || booking.guest_id;
    return guestId === guest.id;
  });
  
  switch (status) {
    case GUEST_STATUSES.CHECKED_IN: {
      const currentBooking = guestBookings.find((booking: any) => booking.status === BOOKING_STATUSES.CHECKED_IN);
      if (currentBooking) {
        const roomId = (currentBooking as any).roomId || (currentBooking as any).room_id;
        const checkIn = (currentBooking as any).checkIn || (currentBooking as any).check_in;
        const checkOut = (currentBooking as any).checkOut || (currentBooking as any).check_out;
        return {
          room: `Room ${roomId}`,
          dates: `Check-in: ${new Date(checkIn).toLocaleDateString()} - Check-out: ${new Date(checkOut).toLocaleDateString()}`
        };
      }
      break;
    }
    case GUEST_STATUSES.UPCOMING: {
      const upcomingBooking = guestBookings
        .filter((booking: any) => {
          const checkIn = booking.checkIn || booking.check_in;
          return booking.status === BOOKING_STATUSES.CONFIRMED && new Date(checkIn) >= new Date();
        })
        .sort((a: any, b: any) => {
          const aCheckIn = a.checkIn || a.check_in;
          const bCheckIn = b.checkIn || b.check_in;
          return new Date(aCheckIn).getTime() - new Date(bCheckIn).getTime();
        })[0];
      
      if (upcomingBooking) {
        const roomId = (upcomingBooking as any).roomId || (upcomingBooking as any).room_id;
        const checkIn = (upcomingBooking as any).checkIn || (upcomingBooking as any).check_in;
        return {
          room: `Room ${roomId}`,
          dates: `Arrival: ${new Date(checkIn).toLocaleDateString()}`
        };
      }
      break;
    }
    default:
      return {
        room: 'No current booking',
        dates: 'No active reservation'
      };
  }
  
  return {
    room: 'No current booking',
    dates: 'No active reservation'
  };
}

// Helper function to calculate total stay duration from real booking data
export function getTotalStayDuration(guest: any, status: string, bookings: any[] = []) {
  const validBookings = Array.isArray(bookings) ? bookings : [];
  const guestId = guest.guestId || guest.guest_id || guest.id;
  const guestBookings = validBookings.filter((booking: any) => {
    const bookingGuestId = booking.guestId || booking.guest_id;
    return bookingGuestId === guestId;
  });
  
  // Calculate total days from all completed bookings
  let totalDays = 0;
  let currentStayDays = 0;
  
  guestBookings.forEach((booking: any) => {
    const checkIn = new Date(booking.checkIn || booking.check_in);
    const checkOut = new Date(booking.checkOut || booking.check_out);
    const stayDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (booking.status === BOOKING_STATUSES.CHECKED_OUT) {
      totalDays += stayDays;
    } else if (booking.status === BOOKING_STATUSES.CHECKED_IN) {
      currentStayDays = Math.ceil((new Date().getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += currentStayDays;
    }
  });
  
  switch (status) {
    case GUEST_STATUSES.CHECKED_IN:
      return {
        total: totalDays,
        current: currentStayDays,
        description: 'Total days stayed'
      };
    case GUEST_STATUSES.PAST_GUEST:
      return {
        total: totalDays,
        current: 0,
        description: 'Total days stayed'
      };
    default:
      return {
        total: totalDays,
        current: 0,
        description: guestBookings.length > 0 ? 'Has future booking' : 'No stays yet'
      };
  }
}

// Categorize guests based on bookings
export function categorizeGuests(guests: any[] = [], bookings: any[] = []) {
  const validBookings = Array.isArray(bookings) ? bookings : [];
  const validGuests = Array.isArray(guests) ? guests : [];

  if (validBookings.length === 0 || validGuests.length === 0) {
    return {
      currentGuests: [],
      arrivingGuests: [],
      departingGuests: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create guest maps for different categories
  const currentGuestsMap = new Map();
  const arrivingGuestsMap = new Map();
  const departingGuestsMap = new Map();

  validBookings.forEach((booking: any) => {
    // Handle both camelCase and snake_case from database
    const checkIn = new Date(booking.checkIn || booking.check_in);
    const checkOut = new Date(booking.checkOut || booking.check_out);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    
    const guestId = booking.guestId || booking.guest_id;
    const guest = validGuests.find(g => g.id === guestId);
    if (!guest) return;

    // Departing today (checked in guests who should check out today OR guests who checked out today)
    if ((booking.status === BOOKING_STATUSES.CHECKED_IN && checkOut.getTime() === today.getTime()) ||
        (booking.status === BOOKING_STATUSES.CHECKED_OUT && checkOut.getTime() === today.getTime())) {
      departingGuestsMap.set(guest.id, { ...guest, booking });
    }
    // Current guests (checked in but not departing today)
    else if (booking.status === BOOKING_STATUSES.CHECKED_IN) {
      currentGuestsMap.set(guest.id, { ...guest, booking });
    }
    
    // Upcoming arrivals (all confirmed future bookings)
    if (booking.status === BOOKING_STATUSES.CONFIRMED && checkIn.getTime() >= today.getTime()) {
      arrivingGuestsMap.set(guest.id, { ...guest, booking });
    }
  });

  return {
    currentGuests: Array.from(currentGuestsMap.values()),
    arrivingGuests: Array.from(arrivingGuestsMap.values()),
    departingGuests: Array.from(departingGuestsMap.values()),
  };
}

// Get loyalty level based on spending
export function getLoyaltyLevel(totalSpent: number) {
  if (totalSpent >= LOYALTY_TIERS.DIAMOND.threshold) {
    return { ...LOYALTY_TIERS.DIAMOND, progress: 100 };
  }
  if (totalSpent >= LOYALTY_TIERS.GOLD.threshold) {
    return { ...LOYALTY_TIERS.GOLD, progress: (totalSpent / LOYALTY_TIERS.DIAMOND.threshold) * 100 };
  }
  if (totalSpent >= LOYALTY_TIERS.SILVER.threshold) {
    return { ...LOYALTY_TIERS.SILVER, progress: (totalSpent / LOYALTY_TIERS.GOLD.threshold) * 100 };
  }
  if (totalSpent >= LOYALTY_TIERS.BRONZE.threshold) {
    return { ...LOYALTY_TIERS.BRONZE, progress: (totalSpent / LOYALTY_TIERS.SILVER.threshold) * 100 };
  }
  return { ...LOYALTY_TIERS.MEMBER, progress: (totalSpent / LOYALTY_TIERS.BRONZE.threshold) * 100 };
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Calculate guest statistics
export function calculateGuestStats(bookings: any[] = []) {
  const completedBookings = bookings.filter(b => b.status === BOOKING_STATUSES.CHECKED_OUT);
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalNights = completedBookings.reduce((sum, b) => {
    const checkIn = new Date(b.checkIn || b.check_in);
    const checkOut = new Date(b.checkOut || b.check_out);
    return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  const avgStayDuration = completedBookings.length > 0 ? totalNights / completedBookings.length : 0;
  
  return {
    totalBookings: bookings.length,
    completedStays: completedBookings.length,
    totalSpent,
    totalNights,
    avgStayDuration,
    currentBooking: bookings.find(b => b.status === BOOKING_STATUSES.CHECKED_IN),
    upcomingBookings: bookings.filter(b => 
      b.status === BOOKING_STATUSES.CONFIRMED && 
      new Date(b.checkIn || b.check_in) >= new Date()
    ),
  };
}

// Filter guests by status
export function filterGuestsByStatus(guests: any[], filterStatus: string | null, bookings: any[] = []) {
  if (!filterStatus || filterStatus === 'all') {
    return guests;
  }

  return guests.filter((guest) => {
    const status = getGuestStatus(guest, bookings);
    switch (filterStatus) {
      case 'checked-in':
        return status === GUEST_STATUSES.CHECKED_IN;
      case 'confirmed':
        return status === GUEST_STATUSES.UPCOMING;
      case 'checked-out':
        return status === GUEST_STATUSES.PAST_GUEST;
      default:
        return true;
    }
  });
}
