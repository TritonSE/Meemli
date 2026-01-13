/**
 * Task route requests.
 */

import express from "express";

import * as SessionController from "../controllers/session";
// import * as SessionValidator from "src/validators/session";

const router = express.Router();

router.get("/:id", SessionController.getSession);

router.post("/", SessionController.createSession);
router.put("/:id", SessionController.editSessionById);

// router.post("/", SessionValidator.createSession, SessionController.createSession);
// router.put("/:id", SessionValidator.editSessionById, SessionController.editSessionById);
// // router.delete("/:id", SessionsController.deleteSession);

export default router;
