CREATE TABLE item_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL
);
