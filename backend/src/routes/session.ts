import express from "express";

import * as SessionController from "../controllers/session";
import * as SessionValidator from "../validators/session";

const router = express.Router();

router.get("/:id", SessionController.getSession);

router.post("/", SessionValidator.createSession, SessionController.createSession);
router.put("/:id", SessionValidator.editSessionById, SessionController.editSessionById);

// router.delete("/:id", SessionsController.deleteSession);

export default router;
