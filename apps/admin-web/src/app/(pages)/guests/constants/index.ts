 
export const GUEST_STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "checked-in", label: "Checked In" },
  { value: "confirmed", label: "Upcoming" },
  { value: "checked-out", label: "Past Guests" },
] as const;

export const GUEST_STATUSES = {
  CHECKED_IN: 'checked-in',
  UPCOMING: 'upcoming',
  PAST_GUEST: 'past-guest',
  NO_BOOKINGS: 'no-bookings',
} as const;

export const BOOKING_STATUSES = {
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'CheckedIn',
  CHECKED_OUT: 'CheckedOut',
  CANCELLED: 'Cancelled',
} as const;

export const LOYALTY_TIERS = {
  MEMBER: { level: 'Member', color: 'blue', threshold: 0 },
  BRONZE: { level: 'Bronze', color: 'orange', threshold: 500 },
  SILVER: { level: 'Silver', color: 'gray', threshold: 2000 },
  GOLD: { level: 'Gold', color: 'yellow', threshold: 5000 },
  DIAMOND: { level: 'Diamond', color: 'purple', threshold: 10000 },
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_DELAY = 300;

export const TABLE_COLUMNS = [
  { key: "avatar", label: "" },
  { key: "name", label: "Guest Name" },
  { key: "contact", label: "Contact" },
  { key: "status", label: "Status" },
  { key: "room", label: "Room & Dates" },
  { key: "stayDuration", label: "Stay Duration" },
  { key: "actions", label: "Actions" },
];

export const BOOKING_HISTORY_COLUMNS = [
  { key: "bookingNumber", label: "Booking #" },
  { key: "dates", label: "Dates" },
  { key: "room", label: "Room" },
  { key: "guests", label: "Guests" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
] as const;

export const GUEST_TABS = [
  { value: "all", label: "All Guests", icon: "IconUsers" },
  { value: "current", label: "Current Guests", icon: "IconBed" },
  { value: "arriving", label: "Upcoming Arrivals", icon: "IconClock" },
  { value: "departing", label: "Departures Today", icon: "IconCheck" },
] as const;
