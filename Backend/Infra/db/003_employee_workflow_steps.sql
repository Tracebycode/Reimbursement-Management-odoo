CREATE TABLE employee_workflow_steps (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES users(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  role TEXT NOT NULL
);