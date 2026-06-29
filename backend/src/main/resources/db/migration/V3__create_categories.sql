CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
