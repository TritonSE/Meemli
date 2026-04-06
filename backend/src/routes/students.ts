import express from "express";

import * as StudentsController from "../controllers/students";
import { validateRequest } from "../middleware/validateRequest";
import * as StudentsValidator from "../validators/students";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/", StudentsController.getAllStudents);
router.get("/:id", StudentsController.getStudentById);

// POST, PUT Routes
router.post(
  "/",
  StudentsValidator.validateCreateStudent,
  validateRequest,
  StudentsController.createStudent,
);
router.put(
  "/:id",
  StudentsValidator.validateEditStudent,
  validateRequest,
  StudentsController.editStudentById,
);

// DELETE Routes
router.delete("/:id", StudentsController.deleteStudentById);

export default router;
