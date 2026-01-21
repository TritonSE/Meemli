/**
 * Program route requests.
 */

import express from "express";

import * as ProgramController from "../controllers/program";
import * as ProgramValidator from "../validators/program";

const router = express.Router();

/**
 * ProgramValidator.createTask serves as middleware for this route. This means
 * that instead of immediately serving up the route when the request is made,
 * Express firsts passes the request to ProgramValidator.createTask.
 * ProgramValidator.createTask processes the request and determines whether the
 * request should be sent through or an error should be thrown.
 */
// "create", 'edit by ID" -- Lucas
router.post("/", ProgramValidator.createProgram, ProgramController.createProgram);
router.put("/:id", ProgramValidator.updateProgram, ProgramController.editByID);

// "get by ID" -- Thomas
router.get("/:id", ProgramController.getProgram);
export default router;
