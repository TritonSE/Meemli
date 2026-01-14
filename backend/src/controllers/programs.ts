import createHttpError from "http-errors";

import ProgramModel from "../../src/models/program";

import type { RequestHandler } from "express";

export const getAllPrograms: RequestHandler = async (req, res, next) => {
  try {
    const programs = await ProgramModel.find();
    if (!programs) {
      throw createHttpError(404, "No programs found.");
    }
    res.status(200).json(programs);
  } catch (error) {
    next(error);
  }
};
