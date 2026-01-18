import mongoose from "mongoose";

// Type definition for Section documents
type SectionDoc = {
  code: string;
  program: mongoose.Schema.Types.ObjectId; // Reference to the Program
  teachers: mongoose.Schema.Types.ObjectId[]; // Array of user IDs for teachers
  enrolledStudents: mongoose.Schema.Types.ObjectId[]; // Array of student IDs
  startTime: string;
  endTime: string;
  days: string[]; // Array of days the section meets
  sessions: mongoose.Schema.Types.ObjectId[]; // Array of session IDs
} & mongoose.Document;

// Definition of the Section schema
const sectionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true, // Code must be provided
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program", // Reference to the Program model
      required: true, // Must be associated with a program
    },
    teachers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User", // Reference to the User model
      required: true, // Must contain at least one teacher
      default: [], // Default to an empty array if no teachers are added
    },
    enrolledStudents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Student", // Reference to the Student model
      required: false, // Not required at creation
      default: [], // Default to an empty array if no students are enrolled
    },
    startTime: {
      type: String,
      required: true, // Start time must be provided
    },
    endTime: {
      type: String,
      required: true, // End time must be provided
    },
    days: {
      type: [String],
      required: true, // Must provide an array of days
    },
    sessions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Session", // Reference to the Session model
      required: false, // Not necessarily required at creation
      default: [], // Default to an empty array if no sessions are created
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
