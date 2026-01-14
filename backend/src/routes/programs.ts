/**
 * Program route requests.
 */

import express from "express";

import * as ProgramsController from "../../src/controllers/programs";

const router = express.Router();

router.get("/", ProgramsController.getAllPrograms);

export default router;
