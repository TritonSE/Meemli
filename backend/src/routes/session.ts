import express from "express";

import * as SessionController from "../controllers/session";
import { validateRequest } from "../middleware/validateRequest";
import * as SessionValidator from "../validators/session";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/", SessionController.getAllSessions);
router.get("/section/:sectionId", SessionController.getSessionsBySectionId);
router.get("/:id", SessionController.getSession);

// POST, PUT Routes
router.post("/", SessionValidator.createSession, validateRequest, SessionController.createSession);
router.put(
  "/:id",
  SessionValidator.editSessionById,
  validateRequest,
  SessionController.editSessionById,
);

// DELETE Routes
// router.delete("/:id", SessionsController.deleteSession);

export default router;
