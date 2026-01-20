import StudentModel from "../models/student";

import type { RequestHandler } from "express";

// Get All Students
export const getAllStudents: RequestHandler = async (req, res, next) => {
  try {
    const students = await StudentModel.find();
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};
