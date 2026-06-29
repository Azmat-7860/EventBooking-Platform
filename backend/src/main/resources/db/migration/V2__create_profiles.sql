CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  mobile VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
