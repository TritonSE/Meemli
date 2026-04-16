import express from "express";

import * as AttendanceController from "../controllers/attendance";
import * as AttendanceValidator from "../validators/attendance";
import { requireAdmin } from "../middleware/requireAdmin";

const router = express.Router();

// Get attendance record by Session ID
router.get("/session/:sessionId", AttendanceController.getAttendanceBySessionId);

// Create attendance record (Admin only, Teachers use bulk update route)
router.post("/", requireAdmin, AttendanceValidator.createAttendance, AttendanceController.createAttendance);

//for saving
router.put("/bulk-update", AttendanceController.updateBulkAttendance);

// Update attendance record by ID
router.put(
  "/:id",
  AttendanceValidator.updateAttendanceById,
  AttendanceController.updateAttendanceById,
);

export default router;
