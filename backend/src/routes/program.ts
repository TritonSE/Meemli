/**
 * Program route requests.
 */

import express from "express";

import * as ProgramController from "../../src/controllers/program";
// import * as ProgramValidator from "../../src/validators/program";

const router = express.Router();

router.get("/:id", ProgramController.getProgram);

export default router;
