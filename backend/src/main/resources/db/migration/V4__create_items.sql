CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  starting_from_text VARCHAR(100),
  video_url TEXT,
  external_url TEXT,
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_name VARCHAR(255),
  bundle_description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published')),
  meta_title VARCHAR(255),
  meta_desc TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_items_vendor ON items(vendor_id);
CREATE INDEX idx_items_slug ON items(slug);
CREATE INDEX idx_items_category ON items(category_id);
