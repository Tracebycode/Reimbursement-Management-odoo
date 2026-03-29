CREATE TABLE expense_approvals (
  id SERIAL PRIMARY KEY,
  expense_id INT REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id INT REFERENCES users(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  status TEXT DEFAULT 'pending',
  comment TEXT
);