import { Request, Response, NextFunction } from "express";
import pool from "../../libs/db";
import AppError from "../../utils/Apperror";
import { insertOrganization, insertUser, getUserByEmail } from "./auth.repository";

// POST /auth/signup
export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, organization_name, currency, password } = req.body;

        // Input validation
        if (!name || !email || !organization_name || !password) {
            throw new AppError("name, email, organization_name and password are required", 400);
        }

        // Check if user with this email already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            throw new AppError("Email already in use", 409);
        }

        // We use a transaction to ensure both org and user are created, or neither is
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // 1. Insert organization
            const orgResult = await client.query(
                `INSERT INTO organizations (name, currency) VALUES ($1, $2) RETURNING *`,
                [organization_name, currency || null]
            );
            const org = orgResult.rows[0];

            // 2. Insert admin user
            const userResult = await client.query(
                `INSERT INTO users (org_id, name, email, role,password) VALUES ($1, $2, $3, 'admin', $4) RETURNING id, org_id, name, email, role, manager_id`,
                [org.id, name, email, password]
            );
            const user = userResult.rows[0];

            await client.query("COMMIT");

            res.status(201).json({
                message: "Signup successful",
                data: {
                    user,
                    organization: org,
                },
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        next(err);
    }
};

// POST /auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError("email is required", 400);
        }

        // Fetch user from DB
        const user = await getUserByEmail(email);

        if (!user) {
            // Constraint: find user by email, if not found return 404
            throw new AppError("User not found", 404);
        }

        res.status(200).json({
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                role: user.role,
                org_id: user.org_id,
            },
        });
    } catch (err) {
        next(err);
    }
};
