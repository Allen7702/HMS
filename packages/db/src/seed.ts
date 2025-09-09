import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { users } from './schema/users';
import { roomTypes } from './schema/roomTypes';
import { rooms } from './schema/rooms';
import { guests } from './schema/guests';
import { bookings } from './schema/bookings';

// Database connection
const sql = postgres('postgresql://postgres:postgres@127.0.0.1:54322/postgres');
const db = drizzle(sql);

// Supabase client for auth operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('Connected to PostgreSQL');

    // Clear existing data (truncate all tables)
    console.log('🧹 Clearing existing data...');
    await sql`TRUNCATE TABLE bookings, rooms, room_types, guests, users RESTART IDENTITY CASCADE;`;
    console.log('✅ All tables cleared');

    // Seed room_types
    console.log('🏠 Seeding room types...');
    const roomTypeRes = await db.insert(roomTypes).values([
      {
        name: 'Small',
        description: 'Compact room with essential amenities',
        capacity: 1,
        priceModifier: -2000, // $20 less than base rate (stored in cents)
      },
      {
        name: 'Standard',
        description: 'Comfortable room with standard amenities',
        capacity: 2,
        priceModifier: 0, // Base rate
      },
    ]).returning();
    
    const roomTypeIds = {
      Small: roomTypeRes.find(r => r.name === 'Small')!.id,
      Standard: roomTypeRes.find(r => r.name === 'Standard')!.id,
    };
    console.log('✅ Seeded 2 room types');

    // Seed rooms with strategic numbering (101-106, 201-206, 301-306)
    console.log('🚪 Seeding rooms...');
    const roomsData: (typeof rooms.$inferInsert)[] = [];
    
    // Floor 1 (101-106) - Mix of Small and Standard, with room 102 occupied
    for (let i = 1; i <= 6; i++) {
      const roomNumber = `10${i}`;
      const isSmall = i === 1; // 101 is small
      roomsData.push({
        roomNumber,
        floor: 1,
        roomTypeId: isSmall ? roomTypeIds.Small : roomTypeIds.Standard,
        status: roomNumber === '102' ? 'Occupied' as const : 'Available' as const,
        features: isSmall ? { size: 'small', wifi: true } : { wifi: true, minibar: true },
      });
    }
    
    // Floor 2 (201-206) - Mix of Small and Standard
    for (let i = 1; i <= 6; i++) {
      const roomNumber = `20${i}`;
      const isSmall = i === 1; // 201 is small
      roomsData.push({
        roomNumber,
        floor: 2,
        roomTypeId: isSmall ? roomTypeIds.Small : roomTypeIds.Standard,
        status: 'Available' as const,
        features: isSmall ? { size: 'small', wifi: true, balcony: true } : { wifi: true, minibar: true, balcony: true },
      });
    }
    
    // Floor 3 (301-306) - Mix of Small and Standard
    for (let i = 1; i <= 6; i++) {
      const roomNumber = `30${i}`;
      const isSmall = i === 1; // 301 is small
      roomsData.push({
        roomNumber,
        floor: 3,
        roomTypeId: isSmall ? roomTypeIds.Small : roomTypeIds.Standard,
        status: 'Available' as const,
        features: isSmall ? 
          { size: 'small', wifi: true, balcony: true, oceanView: true } : 
          { wifi: true, minibar: true, balcony: true, oceanView: true },
      });
    }
    
    const insertedRooms = await db.insert(rooms).values(roomsData).returning();
    console.log(`✅ Seeded ${insertedRooms.length} rooms (101-106, 201-206, 301-306, room 102 occupied)`);

    // Seed users (1 Admin, 1 Manager, 1 Staff)
    console.log('👤 Seeding users...');
    
    const usersToCreate = [
      {
        fullName: 'Hotel Admin',
        username: 'admin',
        email: 'admin@hotelsunshine.com',
        password: 'admin123',
        role: 'admin' as const,
      },
      {
        fullName: 'Hotel Manager',
        username: 'manager',
        email: 'manager@hotelsunshine.com',
        password: 'manager123',
        role: 'manager' as const,
      },
      {
        fullName: 'Front Desk Staff',
        username: 'staff',
        email: 'staff@hotelsunshine.com',
        password: 'staff123',
        role: 'staff' as const,
      },
    ];

    const insertedUsers = [];
    
    for (const userData of usersToCreate) {
      try {
        // 1. Create user in Supabase Auth
        console.log(`  Creating ${userData.role} user in Supabase Auth: ${userData.email}`);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        });

        if (authError) {
          console.warn(`  ⚠️ Supabase auth user might already exist: ${authError.message}`);
        } else {
          console.log(`  ✅ Created auth user: ${userData.email}`);
        }

        // 2. Create user record in our users table
        console.log(`  Creating user record in database: ${userData.username}`);
        const [dbUser] = await db.insert(users).values({
          fullName: userData.fullName,
          username: userData.username,
          email: userData.email,
          password: 'managed_by_supabase', // Placeholder since Supabase handles auth
          role: userData.role,
        }).returning();

        insertedUsers.push(dbUser);
        console.log(`  ✅ Created database user: ${userData.username}`);
        
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`  ⚠️ User ${userData.username} already exists in database, skipping...`);
        } else {
          console.error(`  ❌ Error creating user ${userData.username}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Seeded ${insertedUsers.length} users (with Supabase auth)`);

    // Seed guests
    console.log('👥 Seeding guests...');
    const guestsData = [
      {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St, City, Country',
        loyaltyPoints: 150,
        loyaltyTier: 'Bronze' as const,
        gdprConsent: true,
      },
      {
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '456-789-0123',
        address: '456 Oak Ave, City, Country',
        loyaltyPoints: 500,
        loyaltyTier: 'Silver' as const,
        gdprConsent: true,
      },
      {
        fullName: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '789-012-3456',
        address: '789 Pine St, City, Country',
        loyaltyPoints: 1200,
        loyaltyTier: 'Gold' as const,
        gdprConsent: true,
      },
    ];
    
    const insertedGuests = await db.insert(guests).values(guestsData).returning();
    console.log(`✅ Seeded ${insertedGuests.length} guests`);

    // Seed bookings
    console.log('📅 Seeding bookings...');
    const room101 = insertedRooms.find(r => r.roomNumber === '101')!;
    const room102 = insertedRooms.find(r => r.roomNumber === '102')!;
    const room103 = insertedRooms.find(r => r.roomNumber === '103')!;
    const room205 = insertedRooms.find(r => r.roomNumber === '205')!;
    
    const guest1 = insertedGuests[0]; // John Doe
    const guest2 = insertedGuests[1]; // Jane Smith
    const guest3 = insertedGuests[2]; // Mike Johnson
    
    // Create dates for bookings
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const bookingsData = [
      // Past booking (completed)
      {
        guestId: guest1.id,
        roomId: room101.id,
        checkIn: new Date('2025-01-10'),
        checkOut: new Date('2025-01-12'),
        status: 'CheckedOut' as const,
        source: 'Website',
        rateApplied: 8000, // $80 per night (Small room)
      },
      // Current booking (guest checked in - room 102 occupied)
      {
        guestId: guest2.id,
        roomId: room102.id,
        checkIn: yesterday,
        checkOut: tomorrow,
        status: 'CheckedIn' as const,
        source: 'Booking.com',
        rateApplied: 10000, // $100 per night (Standard room)
      },
      // Future booking
      {
        guestId: guest3.id,
        roomId: room103.id,
        checkIn: tomorrow,
        checkOut: dayAfterTomorrow,
        status: 'Confirmed' as const,
        source: 'Phone',
        rateApplied: 10000, // $100 per night (Standard room)
      },
      // Another future booking
      {
        guestId: guest1.id,
        roomId: room205.id,
        checkIn: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        checkOut: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
        status: 'Pending' as const,
        source: 'Website',
        rateApplied: 10000, // $100 per night (Standard room)
      },
    ];
    
    const insertedBookings = await db.insert(bookings).values(bookingsData).returning();
    console.log(`✅ Seeded ${insertedBookings.length} bookings`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`- Room Types: ${roomTypeRes.length} (Small & Standard)`);
    console.log(`- Rooms: ${insertedRooms.length} (room 102 occupied)`);
    console.log(`- Users: ${insertedUsers.length} (created in both Supabase Auth and database)`);
    console.log(`- Guests: ${insertedGuests.length}`);
    console.log(`- Bookings: ${insertedBookings.length}`);
    console.log('\nLogin Credentials (Email or Username):');
    console.log('- admin@hotelsunshine.com or "admin" / admin123');
    console.log('- manager@hotelsunshine.com or "manager" / manager123');
    console.log('- staff@hotelsunshine.com or "staff" / staff123');
    console.log('\nRoom Layout:');
    console.log('- Small rooms (x01): $80/night - 101, 201, 301');
    console.log('- Standard rooms: $100/night - All others');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the seed function
seedDatabase().catch((error) => {
  console.error(error);
  throw error;
});
