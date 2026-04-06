import express from "express";

import * as UserController from "../controllers/user";
import { validateRequest } from "../middleware/validateRequest";
import * as UserValidator from "../validators/user";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.whoAmI);

// POST, PUT Routes
router.post("/", UserValidator.validateCreateUser, validateRequest, UserController.createUser);
router.put("/:id", UserValidator.validateEditUser, validateRequest, UserController.editUserById);

export default router;
