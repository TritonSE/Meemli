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
  const {
    parentContact: { firstName, lastName, phoneNumber, email },
    displayName,
    meemliEmail,
    grade,
    schoolName,
    city,
    state,
    preassessmentScore,
    postassessmentScore,
    enrolledSections,
    comments,
  } = req.body as CreateStudentBody;

  if (
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !email ||
    !displayName ||
    !meemliEmail ||
    !grade ||
    !schoolName ||
    !city ||
    !state ||
    !preassessmentScore ||
    !postassessmentScore ||
    !enrolledSections ||
    !comments
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const enrolledSectionsIds = enrolledSections.map((section) => new Types.ObjectId(section));
  if (!enrolledSectionsIds.every((section) => Types.ObjectId.isValid(section))) {
    return res.status(400).json({ message: "Invalid enrolled sections" });
  }

  try {
    const student = await StudentModel.create({
      parentContact: {
        firstName,
        lastName,
        phoneNumber,
        email,
      },
      displayName,
      meemliEmail,
      grade,
      schoolName,
      city,
      state,
      preassessmentScore,
      postassessmentScore,
      enrolledSections: enrolledSectionsIds,
      comments,
    });

    const populatedStudent = await student.populate("enrolledSections");
    res.status(201).json(populatedStudent);
  } catch (error) {
    next(error);
  }
};

// Get by ID
export const getStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  try {
    const student = await StudentModel.findById(id).populate("enrolledSections");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// Edit by ID
type EditStudentBody = Partial<CreateStudentBody>;

export const editStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  const updates: EditStudentBody = req.body as EditStudentBody;

  try {
    const student = await StudentModel.findByIdAndUpdate(id, updates, { new: true }).populate(
      "enrolledSections",
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// Delete by ID
export const deleteStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  try {
    const student = await StudentModel.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};
