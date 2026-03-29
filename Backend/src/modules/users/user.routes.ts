import { Router } from "express";
import { createUser, getUsers, getUser } from "./user.controller";

const router = Router();

// User management (Admin)
router.post("/users", createUser);
router.get("/users", getUsers);
router.get("/users/:id", getUser);

export default router;
