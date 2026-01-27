import express from "express";

import * as AttendanceController from "../controllers/attendance";
import * as AttendanceValidator from "../validators/attendance";


const router = express.Router();

// Get attendance record by Session ID
router.get("/session/:sessionId", AttendanceController.getAttendanceBySessionId);

// Create attendance record
router.post("/", AttendanceValidator.createAttendance, AttendanceController.createAttendance);

// Update attendance record by ID
router.put("/:id", AttendanceValidator.updateAttendanceById, AttendanceController.updateAttendanceById);

export default router;