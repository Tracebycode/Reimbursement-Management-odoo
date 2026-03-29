CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL, -- admin, employee, manager, finance, etc.
  manager_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);