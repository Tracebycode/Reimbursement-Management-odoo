CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
