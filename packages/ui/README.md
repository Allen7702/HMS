# Hotel Management System UI Package

This package provides React contexts and UI components for the hotel management system with Supabase integration.

## Contexts Included

### Core Contexts

1. **AuthContext** - Supabase authentication and authorization
2. **ThemeContext** - Mantine theme management with dark/light mode
3. **NotificationContext** - Application notifications and alerts
4. **AppContext** - Application-wide settings and hotel configuration
5. **WebSocketContext** - Real-time communication
6. **HotelContext** - Hotel operations (rooms, bookings, guests) with Supabase

### Usage

```tsx
import { RootProvider } from '@hotel-management/ui';

function App() {
  return (
    <RootProvider websocketUrl="ws://localhost:3001/ws">
      {/* Your app components */}
    </RootProvider>
  );
}
```

### Supabase Integration

The package includes full Supabase integration for:

- **Authentication**: Sign up, sign in, password reset, session management
- **Real-time subscriptions**: Live updates for rooms, bookings, and guests
- **Database operations**: CRUD operations for all hotel entities
- **File storage**: Document and image upload capabilities

### Environment Variables

Create a `.env.local` file in your app root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Individual Context Usage

```tsx
import { 
  useAuth, 
  useTheme, 
  useNotifications, 
  useApp, 
  useWebSocket, 
  useHotel,
  useRealtimeSubscriptions 
} from '@hotel-management/ui';

function MyComponent() {
  const { user, login, logout, register } = useAuth();
  const { rooms, bookings, createBooking, fetchRooms } = useHotel();
  const { colorScheme, toggleColorScheme } = useTheme();
  const { showMantineNotification } = useNotifications();
  
  // Enable real-time updates
  useRealtimeSubscriptions();
  
  // Component logic here
}
```

## Supabase Database Schema

The package expects the following Supabase tables:

- `users` - System users with roles
- `guests` - Hotel guests
- `rooms` - Hotel rooms
- `room_types` - Room type definitions
- `bookings` - Booking records
- `maintenances` - Maintenance requests
- `invoices` - Billing records
- `audit_logs` - System audit trail
- `notifications` - System notifications
- `housekeepings` - Housekeeping tasks
- `ota_reservations` - OTA integration data

## Real-time Features

- Live room status updates
- Instant booking notifications
- Real-time occupancy tracking
- Guest check-in/out notifications
- Maintenance status changes

## API Utilities

```tsx
import { SupabaseAPI, SupabaseAuth } from '@hotel-management/ui';

// Generic CRUD operations
const rooms = await SupabaseAPI.get('rooms');
const room = await SupabaseAPI.getById('rooms', 1);
const newRoom = await SupabaseAPI.create('rooms', roomData);

// Authentication utilities
const user = await SupabaseAuth.getCurrentUser();
const session = await SupabaseAuth.getCurrentSession();
```

## Features

- **Type-safe** - Full TypeScript support with Supabase types
- **Real-time updates** - Supabase subscriptions + WebSocket fallback
- **Theme management** - Mantine-based theming with customization
- **State management** - Centralized state for hotel operations
- **Authentication** - Complete Supabase auth flow
- **Error handling** - Comprehensive error handling with notifications
- **File uploads** - Supabase storage integration

## Installation

```bash
pnpm install
```

## Dependencies

- React 19.1.0
- Mantine v7 (core, hooks, notifications)
- Supabase JS v2
- TypeScript
- Tabler Icons

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type check
pnpm type-check
```

The package integrates seamlessly with Supabase for authentication, real-time subscriptions, and database operations.
