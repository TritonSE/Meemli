import express from "express";

import * as SessionController from "../controllers/session";
import * as SessionValidator from "../validators/session";
import { requireAdmin } from "../middleware/requireAdmin";

const router = express.Router();

router.get("/", SessionController.getAllSessions);
router.get("/section/:sectionId", SessionController.getSessionsBySectionId);
router.get("/:id", SessionController.getSession);

router.post("/", requireAdmin, SessionValidator.createSession, SessionController.createSession);
router.put("/:id", requireAdmin, SessionValidator.editSessionById, SessionController.editSessionById);

// router.delete("/:id", SessionsController.deleteSession);

export default router;
