"use client";
import { useState } from "react";

import type { Student } from "@/src/api/students";
import type { Section } from "@/src/api/sections"

import { getAllSections } from "@/src/api/sections";
// API & Types
import { getStudent } from "@/src/api/students";
import { CreateSectionFlow } from "@/src/components/SectionForm/SectionForm";
// Components
import { StudentCard } from "@/src/components/StudentCard/StudentCard";
import { StudentProfileModal } from "@/src/components/StudentProfileView/StudentProfileView";
import { spawnSuccessDialog } from "@/src/components/SuccessPopup/SuccessPopup";
import TestStudentForm from "@/src/pages/TestStudentForm";

const EDIT_SECTION_ID_EXAMPLE = "69afa73190beaafad01125f3"

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
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [sectionModalState, setSectionState] = useState<"active" | null>(null);
  const [editSectionModalState, setEditSectionState] = useState<"active" | null>(null);


  function toggleSection() {
    if (sectionModalState == null) {
      setSectionState("active");
    } else {
      setSectionState(null);
    }
  }

  function toggleEditSection() {
    if (editSectionModalState == null) {
      setEditSectionState("active");
    } else {
      setEditSectionState(null);
    }
  }
  


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
          style={{
            border: "1px solid var(--grey-200)",
            padding: "0.5rem 0.9rem",
            borderRadius: "8px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Click to open section
        </button>

        
        <button
          onClick={() => {
            toggleEditSection();
          }}
          style={{
            border: "1px solid var(--grey-200)",
            padding: "0.5rem 0.9rem",
            borderRadius: "8px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Click to open EDIT section {EDIT_SECTION_ID_EXAMPLE}
        </button>

        
        <button
          onClick={() => {
            void (async () => {
              const result = await getAllSections();
              if (result.success) {
                console.info("Sections List:", result.data);
              } else {
                console.error("Failed to fetch sections:", result.error);
              }
            })();
          }}
        >
          {" "}
          fetch all sections{" "}
        </button>

        <br></br>
        <button onClick={() => spawnSuccessDialog("success")}> SPAWN SUCESSS DIALOG </button>

        
        <CreateSectionFlow
          active={sectionModalState === "active"}
          onClose={() => toggleSection()}
        />
        <CreateSectionFlow
          active={editSectionModalState === "active"}
          onClose={() => toggleEditSection()}
          sectionId={EDIT_SECTION_ID_EXAMPLE}
        />


        <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      </div>

      <TestStudentForm />
    </div>
  );
}
