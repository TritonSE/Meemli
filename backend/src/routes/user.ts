import express from "express";

import * as UserController from "../controllers/user";
import { validateRequest } from "../middleware/validateRequest";
import * as UserValidator from "../validators/user";

const router = express.Router();

// Create User
router.post("/", UserValidator.validateCreateUser, validateRequest, UserController.createUser);

// Batch archive Users
router.put("/archive", UserController.archiveUsersByIds);

// Edit User by ID
router.put("/:id", UserValidator.validateEditUser, validateRequest, UserController.editUserById);

// Get All Users
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.whoAmI);

// Batch delete users
router.delete("/delete", UserController.deleteUsersByIds);

export default router;
