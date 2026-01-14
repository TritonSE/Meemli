/**
 * Functions that process task route requests.
 */

import createHttpError from "http-errors";

import ProgramModel from "../../src/models/program";

import type { RequestHandler } from "express";

/**
 * Get a program by its ID
 * @param req The Request object from Express. This contains all the data from
 * the API request. (https://expressjs.com/en/4x/api.html#req)
 * @param res The Response object from Express. We use this to generate the API
 * response for Express to send back. (https://expressjs.com/en/4x/api.html#res)
 * @param next The next function in the chain of middleware. If there's no more
 * processing we can do in this handler, but we're not completely done handling
 * the request, then we can pass it along by calling next().
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
