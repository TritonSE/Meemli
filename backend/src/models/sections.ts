import mongoose from "mongoose";

import type { Document, Types } from "mongoose"; // Types still used for ObjectId arrays in teachers/enrolledStudents

// Type definition for Section documents
export type SectionDoc = Document & {
  code: string;
  teachers: string[];
  enrolledStudents: Types.ObjectId[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  archived: boolean;
  color: string;
  days: string[];
};

// Definition of the Section schema
const sectionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true, // Code must be provided
    },
    teachers: {
      type: [String],
      ref: "User", // Reference to the User model
      required: true, // Must contain at least one teacher
      default: [], // Default to an empty array if no teachers are added
    },
    enrolledStudents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Student",
      default: [],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true, // End time must be provided
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#ff00ff",
    },
    days: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true, // CreatedAt and UpdatedAt fields
  },
);

// Creating the Section model using the defined schema
const Section = mongoose.model<SectionDoc>("Section", sectionSchema);

// Exporting the Section model for use in other parts of the application
export { Section };
