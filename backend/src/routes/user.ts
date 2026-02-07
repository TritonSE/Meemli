import express from "express";

import * as UserController from "../controllers/user";
import * as UserValidator from "../validators/user";

const router = express.Router();

// Create User
router.post("/", UserValidator.validateCreateUser, UserController.createUser);

// Edit User by ID
router.put("/:id", UserValidator.validateEditUser, UserController.editUserById);

// Who Am I
router.get("/:id", UserController.whoAmI);

export default router;
