import express from "express";

import * as StudentsController from "../controllers/students";

const router = express.Router();

// Get All Students
router.get("/", StudentsController.getAllStudents);

export default router;
