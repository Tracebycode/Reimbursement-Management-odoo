CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount FLOAT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);