CREATE TABLE item_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0
);
