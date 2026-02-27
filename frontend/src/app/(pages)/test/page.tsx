"use client";
import { useState } from "react";

// Components
import { CreateSectionFlow } from "../../../components/SectionForm/SectionForm";
import { StudentCard } from "../../(ui)/_components/StudentCard/StudentCard";
import { StudentProfileModal } from "../../(ui)/_components/StudentProfileView/StudentProfileView";

import type { Student } from "@/src/api/students";

// API & Types
import { getStudent } from "@/src/api/students";
import { ColorInput } from "@/src/components/ColorInput";
import TestStudentForm from "@/src/pages/TestStudentForm";

export default function Test() {
  // --- FAKE DATA for testing student profile view ---
  const FAKE_STUDENTS = [
    {
      _id: "1",
      displayName: "Alice Johnson",
      meemliEmail: "alice@test.com",
      grade: 10,
      schoolName: "Lincoln High",
      city: "San Diego",
      state: "CA",
      parentContact: {
        firstName: "Mrs",
        lastName: "Johnson",
        phoneNumber: "555-0101",
        email: "mom@test.com",
      },
      preassessmentScore: 0,
      postassessmentScore: 0,
      enrolledSections: [],
      comments: "",
    },
    {
      _id: "2",
      displayName: "Bob Smith",
      meemliEmail: "bob@test.com",
      grade: 11,
      schoolName: "Washington High",
      city: "Seattle",
      state: "WA",
      parentContact: {
        firstName: "Mr",
        lastName: "Smith",
        phoneNumber: "555-0102",
        email: "dad@test.com",
      },
      preassessmentScore: 0,
      postassessmentScore: 0,
      enrolledSections: [],
      comments: "",
    },
    {
      _id: "3",
      displayName: "Charlie Davis",
      meemliEmail: "charlie@test.com",
      grade: 9,
      schoolName: "Roosevelt High",
      city: "Austin",
      state: "TX",
      parentContact: {
        firstName: "Ms",
        lastName: "Davis",
        phoneNumber: "555-0103",
        email: "mum@test.com",
      },
      preassessmentScore: 0,
      postassessmentScore: 0,
      enrolledSections: [],
      comments: "",
    },
  ];

  // --- 2. STATE ---
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sectionModalState, setSectionState] = useState<"active" | null>(null);

  function toggleSection() {
    if (sectionModalState == null) {
      setSectionState("active");
    }
    else {
      setSectionState(null);
    }
  }

  // const [sectionModalOpen, ]

  // New state for handling the "Real ID" input
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- 3. HANDLER FOR BACKEND CALL ---
  const handleOpenRealStudent = async () => {
    if (!manualId) return;

    setLoading(true);
    setError("");

    try {
      const result = await getStudent(manualId);

      if (result.success) {
        // SUCCESS: populates the state and OPENS the modal automatically
        setSelectedStudent(result.data);
      } else {
        setError("Student not found or API error");
      }
    } catch (err) {
      setError("Network or Server Error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ padding: "20px" }}>
        <h1> Create Class Form</h1>

        <h1>Test Page</h1>
        {/* <SectionForm> */}

        {/* --- TEST REAL ID --- */}
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px dashed #ccc",
            background: "#f9f9f9",
          }}
        >
          <h3>Test Real Backend ID</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Paste MongoDB ID here..."
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              style={{ padding: "8px", width: "300px" }}
            />
            <button
              onClick={() => void handleOpenRealStudent()}
              disabled={loading}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              {loading ? "Fetching..." : "Open Real Modal"}
            </button>
          </div>
          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
        </div>

        {/* --- EXISTING FAKE LIST --- */}
        <h3>Fake Data List</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
          {FAKE_STUDENTS.map((student: Student) => (
            <div
              key={student._id}
              onClick={() => setSelectedStudent(student)}
              style={{ cursor: "pointer" }}
            >
              <StudentCard variant="list" data={student} />
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            toggleSection();
          }}
        >
          Click to open section
        </button>
        <br/>
        <ColorInput colors={["#17AAC4", "#25CA7D", "#416F7E", "#D54525", "#DA7A51", "#FFBE31", "#B6B8BA"]}/>

        <CreateSectionFlow active={sectionModalState === "active"} onClose={() => toggleSection()} />
        <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      </div>

      <TestStudentForm />
    </div>
  );
}
