import express from "express";

import * as UserController from "../controllers/user";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateRequest } from "../middleware/validateRequest";
import * as UserValidator from "../validators/user";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/", requireAdmin, UserController.getAllUsers);
router.get("/:id", UserController.whoAmI); // teachers may call this for themselves only (enforced in controller)

// POST, PUT Routes
router.post("/", requireAdmin, UserValidator.validateCreateUser, validateRequest, UserController.createUser);
router.put("/:id", requireAdmin, UserValidator.validateEditUser, validateRequest, UserController.editUserById);

export default router;
