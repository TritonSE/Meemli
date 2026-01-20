import createHttpError from "http-errors";

import ProgramModel from "../../src/models/program";

import type { RequestHandler } from "express";

/**
 * Get a program by its ID
 * @param req The Request object from Express. This contains all the data from
 * the API request
 * @param res The Response object from Express. We use this to generate the API
 * response for Express to send back
 * @param next The next function in the chain of middleware
 */
export const getProgram: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const program = await ProgramModel.findById(id);
    if (!program) {
      throw createHttpError(404, "Program not found.");
    }

    res.status(200).json(program);
  } catch (error) {
    next(error);
  }
};
