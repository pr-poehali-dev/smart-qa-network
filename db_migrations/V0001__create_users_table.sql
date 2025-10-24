CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    has_pro BOOLEAN DEFAULT FALSE,
    messages_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

INSERT INTO users (email, password_hash, role, has_pro) 
VALUES ('admin@ai-platform.com', 'admin_hash_skzry_R.ofical.1', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;