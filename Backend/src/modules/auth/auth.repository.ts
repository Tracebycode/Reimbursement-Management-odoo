import pool from "../../libs/db";

// Insert a new organization
export const insertOrganization = async (name: string, currency?: string) => {
    const result = await pool.query(
        `INSERT INTO organizations (name, currency)
         VALUES ($1, $2)
         RETURNING *`,
        [name, currency || null]
    );
    return result.rows[0];
};

// Find a user by email
export const getUserByEmail = async (email: string) => {
    const result = await pool.query(
        `SELECT id, org_id, name, email, role, manager_id, password 
         FROM users 
         WHERE email = $1`,
        [email]
    );
    return result.rows[0] || null;
};

// Insert a new user
export const insertUser = async (
    orgId: number,
    name: string,
    email: string,
    role: string,
    managerId?: number
) => {
    const result = await pool.query(
        `INSERT INTO users (org_id, name, email, role, manager_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, org_id, name, email, role, manager_id`,
        [orgId, name, email, role, managerId || null]
    );
    return result.rows[0];
};
