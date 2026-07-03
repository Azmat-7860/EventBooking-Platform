CREATE TABLE analytics_events (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    item_id UUID,
    user_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
