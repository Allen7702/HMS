-- Users policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Guests policies
CREATE POLICY "Users can read all guests" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage guests" ON guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Room types policies
CREATE POLICY "Anyone can read room types" ON room_types
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage room types" ON room_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- Rooms policies
CREATE POLICY "Anyone can read rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage rooms" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Bookings policies
CREATE POLICY "Users can read all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Maintenances policies
CREATE POLICY "Users can read maintenances" ON maintenances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage maintenances" ON maintenances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Invoices policies
CREATE POLICY "Users can read invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Audit logs policies
CREATE POLICY "Only admins can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can read all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Housekeepings policies
CREATE POLICY "Users can read housekeepings" ON housekeepings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage housekeepings" ON housekeepings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );

-- OTA reservations policies
CREATE POLICY "Users can read OTA reservations" ON ota_reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage OTA reservations" ON ota_reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager', 'staff')
    )
  );
