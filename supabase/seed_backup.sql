-- Insert default room types
INSERT INTO room_types (name, description, capacity, price_modifier) VALUES
('Standard Single', 'Standard room with single bed', 1, 0),
('Standard Double', 'Standard room with double bed', 2, 100),
('Deluxe', 'Deluxe room with enhanced amenities', 2, 250),
('Suite', 'Luxury suite with separate living area', 4, 500),
('Presidential Suite', 'Premium luxury suite', 6, 1000);

-- Insert sample rooms
INSERT INTO rooms (room_number, floor, room_type_id, status, features) VALUES
('101', 1, 1, 'Available', '{"wifi": true, "tv": true, "ac": true}'),
('102', 1, 1, 'Available', '{"wifi": true, "tv": true, "ac": true}'),
('103', 1, 2, 'Available', '{"wifi": true, "tv": true, "ac": true, "minibar": true}'),
('104', 1, 2, 'Available', '{"wifi": true, "tv": true, "ac": true, "minibar": true}'),
('201', 2, 3, 'Available', '{"wifi": true, "tv": true, "ac": true, "minibar": true, "balcony": true}'),
('202', 2, 3, 'Available', '{"wifi": true, "tv": true, "ac": true, "minibar": true, "balcony": true}'),
('301', 3, 4, 'Available', '{"wifi": true, "tv": true, "ac": true, "minibar": true, "balcony": true, "kitchenette": true}'),
('401', 4, 5, 'Available', '{"wifi": true, "tv": true, "ac": true, "minibar": true, "balcony": true, "kitchenette": true, "jacuzzi": true}');

-- Insert sample users (Note: In production, these would be created through Supabase Auth)
INSERT INTO users (id, full_name, username, email, role) VALUES
(1, 'Admin User', 'admin', 'admin@hotel.com', 'admin'),
(2, 'Hotel Manager', 'manager', 'manager@hotel.com', 'manager'),
(3, 'Front Desk Staff', 'staff1', 'staff1@hotel.com', 'staff'),
(4, 'Housekeeping Staff', 'staff2', 'staff2@hotel.com', 'staff');

-- Insert sample guests
INSERT INTO guests (name, email, phone, address, loyalty_points, loyalty_tier, gdpr_consent) VALUES
('John Doe', 'john.doe@email.com', '+1234567890', '123 Main St, City, State', 500, 'Bronze', true),
('Jane Smith', 'jane.smith@email.com', '+1234567891', '456 Oak Ave, City, State', 1500, 'Silver', true),
('Mike Johnson', 'mike.johnson@email.com', '+1234567892', '789 Pine St, City, State', 3000, 'Gold', true),
('Sarah Wilson', 'sarah.wilson@email.com', '+1234567893', '321 Elm St, City, State', 100, 'None', true);

-- Insert sample bookings
INSERT INTO bookings (guest_id, room_id, check_in, check_out, status, source, rate_applied) VALUES
(1, 1, '2024-01-15 15:00:00+00', '2024-01-18 11:00:00+00', 'Confirmed', 'Direct', 15000),
(2, 3, '2024-01-20 15:00:00+00', '2024-01-25 11:00:00+00', 'Confirmed', 'Booking.com', 16000),
(3, 5, '2024-01-22 15:00:00+00', '2024-01-24 11:00:00+00', 'Pending', 'Direct', 25000),
(4, 2, '2024-01-25 15:00:00+00', '2024-01-27 11:00:00+00', 'Confirmed', 'Expedia', 15500);
