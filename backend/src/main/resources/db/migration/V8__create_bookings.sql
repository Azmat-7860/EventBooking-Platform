CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  customer_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES users(id),
  preferred_date DATE,
  from_time TIME,
  to_time TIME,
  from_location TEXT,
  to_location TEXT,
  name VARCHAR(255),
  mobile VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
