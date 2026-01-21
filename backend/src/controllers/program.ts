/**
 * Functions that process task route requests.
 */

import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import ProgramModel from "../models/program";
import validationErrorParser from "../util/validationErrorParser";

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

/**
 * This is an example of an Express API request handler. We'll tell Express to
 * run this function when our backend receives a request to retrieve a
 * particular task.
 *
 * Request handlers typically have 3 parameters: req, res, and next.
 *
 * @param req The Request object from Express. This contains all the data from
 * the API request. (https://expressjs.com/en/4x/api.html#req)
 * @param res The Response object from Express. We use this to generate the API
 * response for Express to send back. (https://expressjs.com/en/4x/api.html#res)
 * @param next The next function in the chain of middleware. If there's no more
 * processing we can do in this handler, but we're not completely done handling
 * the request, then we can pass it along by calling next(). For all of the
 * handlers defined in `src/controllers`, the next function is the global error
 * handler in `src/app.ts`.
 */

// createProgram and editProgram

// Define a custom type for the request body so we can have static typing
// for the fields
type CreateProgramBody = {
  code?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  archived?: boolean;
};

export const createProgram: RequestHandler = async (req, res, next) => {
  // extract any errors that were found by the validator
  const errors = validationResult(req);
  const { code, name, startDate, endDate, description, archived } = req.body as CreateProgramBody;

  try {
    // if there are errors, then this function throws an exception
    validationErrorParser(errors);

    const program = await ProgramModel.create({
      code,
      name,
      startDate,
      endDate,
      description,
      archived,
    });

    // 201 means a new resource has been created successfully
    // the newly created task is sent back to the user
    res.status(201).json(program);
  } catch (error) {
    next(error);
  }
};

type UpdateProgramBody = {
  _id: string;
  code?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  archived?: boolean;
};

export const editByID: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { _id, code, name, startDate, endDate, description, archived } =
      req.body as UpdateProgramBody;

    const updatedProgram = await ProgramModel.findByIdAndUpdate(
      id,
      { code, name, startDate, endDate, description, archived },
      { new: true },
    );

    if (!updatedProgram) {
      throw createHttpError(404, "Task not found");
    }

    res.status(200).json(updatedProgram);
  } catch (error) {
    // This block is required to resolve the "catch expected" error
    next(error);
  }
};
