import express from "express";

import * as UserController from "../controllers/user";
import * as UserValidator from "../validators/user";

const router = express.Router();

// Create User
router.post("/", UserValidator.validateCreateUser, UserController.createUser);

// Batch archive Users
router.put("/archive", UserController.archiveUsersByIds);

// Edit User by ID
router.put("/:id", UserValidator.validateEditUser, UserController.editUserById);

// Get All Users
router.get("/", UserController.getAllUsers);

// Who Am I
router.get("/:id", UserController.whoAmI);

// Batch delete users
router.delete("/delete", UserController.deleteUsersByIds);

export default router;
