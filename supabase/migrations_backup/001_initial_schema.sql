-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE loyalty_tier AS ENUM ('None', 'Bronze', 'Silver', 'Gold');
CREATE TYPE room_status AS ENUM ('Available', 'Occupied', 'Maintenance', 'Dirty');
CREATE TYPE booking_status AS ENUM ('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled');
CREATE TYPE maintenance_status AS ENUM ('Open', 'In Progress', 'Resolved');
CREATE TYPE maintenance_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE invoice_status AS ENUM ('Not Paid', 'Pending', 'Paid');
CREATE TYPE notification_type AS ENUM ('Email', 'SMS', 'Push');
CREATE TYPE notification_status AS ENUM ('Pending', 'Sent', 'Failed');
CREATE TYPE housekeeping_status AS ENUM ('Pending', 'In Progress', 'Completed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(256),
  username VARCHAR(256) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  role user_role DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room types table
CREATE TABLE IF NOT EXISTS room_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  capacity INTEGER DEFAULT 1 NOT NULL,
  price_modifier INTEGER DEFAULT 0
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  floor INTEGER NOT NULL,
  room_type_id INTEGER REFERENCES room_types(id),
  status room_status DEFAULT 'Available' NOT NULL,
  features JSONB,
  last_cleaned TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  preferences JSONB,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier loyalty_tier DEFAULT 'None',
  gdpr_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES guests(id),
  room_id INTEGER REFERENCES rooms(id),
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status NOT NULL,
  source VARCHAR(50),
  rate_applied INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenances table
CREATE TABLE IF NOT EXISTS maintenances (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id),
  description TEXT NOT NULL,
  status maintenance_status NOT NULL,
  priority maintenance_priority NOT NULL,
  assignee_id INTEGER REFERENCES users(id),
  history JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  receipt TEXT NOT NULL,
  status invoice_status NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type notification_type NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status notification_status NOT NULL,
  related_entity_id INTEGER,
  entity_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Housekeepings table
CREATE TABLE IF NOT EXISTS housekeepings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id),
  status housekeeping_status NOT NULL,
  assignee_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTA reservations table
CREATE TABLE IF NOT EXISTS ota_reservations (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  ota_id VARCHAR(100) NOT NULL,
  ota_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings (guest_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices (booking_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms (status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (check_in, check_out);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeepings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_reservations ENABLE ROW LEVEL SECURITY;
