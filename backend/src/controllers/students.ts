import createHTTPError from "http-errors";
import { Types } from "mongoose";

import StudentModel from "../models/student";

import type { RequestHandler } from "express";

// Create Student Body
type CreateStudentBody = {
  parentContact: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  displayName: string;
  meemliEmail: string;
  grade: number;
  schoolName: string;
  city: string;
  state: string;
  preassessmentScore: number;
  postassessmentScore: number;
  enrolledSections: string[];
  comments: string;
};

export const createStudent: RequestHandler = async (req, res, next) => {
  const { enrolledSections, ...studentData } = req.body as CreateStudentBody;
  const enrolledSectionsIds = enrolledSections.map((section) => new Types.ObjectId(section));

  try {
    const student = await StudentModel.create({
      ...studentData,
      enrolledSections: enrolledSectionsIds,
      archived: false,
    });

    const populatedStudent = await student.populate("enrolledSections");
    res.status(201).json(populatedStudent);
  } catch (error) {
    return next(error);
  }
};

// Get All Students
export const getAllStudents: RequestHandler = async (req, res, next) => {
  try {
    const students = await StudentModel.find();
    res.status(200).json(students);
  } catch (error) {
    return next(error);
  }
};

// Get by ID
export const getStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    throw createHTTPError(400, "Invalid student ID");
  }

  try {
    const student = await StudentModel.findById(id).populate("enrolledSections");
    if (!student) {
      throw createHTTPError(404, "Student not found");
    }
    res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

// Edit by ID
type EditStudentBody = Partial<CreateStudentBody>;

export const editStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    throw createHTTPError(400, "Invalid student ID");
  }

  const updates: EditStudentBody = req.body as EditStudentBody;

  try {
    const student = await StudentModel.findByIdAndUpdate(id, updates, { new: true }).populate(
      "enrolledSections",
    );
    if (!student) {
      throw createHTTPError(404, "Student not found");
    }
    res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

// Mass edits so there arent a bunch of separate requests
export const archiveStudentsByIds: RequestHandler = async (req, res, next) => {
  const { ids, flag } = req.body as { ids: string[]; flag: boolean };
  const validIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  if (validIds.length === 0) {
    throw createHTTPError(400, "No valid student IDs provided");
  }

  try {
    await StudentModel.updateMany({ _id: { $in: validIds } }, { $set: { archived: flag } });

    // return the updated documents so the frontend can sync its state
    const students = await StudentModel.find({ _id: { $in: validIds } }).populate(
      "enrolledSections",
    );
    res.status(200).json(students);
  } catch (error) {
    return next(error);
  }
};

// Delete by ID
export const deleteStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    throw createHTTPError(400, "Invalid student ID");
  }

  try {
    const student = await StudentModel.findByIdAndDelete(id);
    if (!student) {
      throw createHTTPError(404, "Student not found");
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const deleteStudentsByIds: RequestHandler = async (req, res, next) => {
  const { ids } = req.body as { ids: string[] };
  const validIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  if (validIds.length === 0) {
    throw createHTTPError(400, "No valid student IDs provided");
  }
  try {
    await StudentModel.deleteMany({ _id: { $in: validIds } });
    const remainingStudents = await StudentModel.find({}).populate("enrolledSections");
    res.status(200).json(remainingStudents);
  } catch (error) {
    return next(error);
  }
};
