import express from "express";

import * as UserController from "../controllers/user";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateRequest } from "../middleware/validateRequest";
import * as UserValidator from "../validators/user";

const router = express.Router();

// POST, PUT Routes
// Create User
router.post(
  "/",
  requireAdmin,
  UserValidator.validateCreateUser,
  validateRequest,
  UserController.createUser,
);

// Batch archive Users
router.put("/archive", requireAdmin, UserController.archiveUsersByIds);

// Edit User by ID
router.put(
  "/:id",
  requireAdmin,
  UserValidator.validateEditUser,
  validateRequest,
  UserController.editUserById,
);

// Get All Users
router.get("/", requireAdmin, UserController.getAllUsers);
router.get("/:id", UserController.whoAmI); // teachers may call this for themselves only (enforced in controller)

// Batch delete users
router.delete("/delete", requireAdmin, UserController.deleteUsersByIds);

export default router;
