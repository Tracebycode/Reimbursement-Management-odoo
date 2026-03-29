import { Router } from "express";
import { setWorkflow, getWorkflow, deleteWorkflow } from "./workflow.controller";

const router = Router();

router.post("/workflow", setWorkflow);
router.get("/workflow/:employee_id", getWorkflow);
router.delete("/workflow/:employee_id", deleteWorkflow);

export default router;
