import { useEffect, useState } from "react";

import { getAttendanceBySessionId, updateAttendanceBulk } from "../api/attendance";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  updateSection,
} from "../api/sections";
import {
  createSession,
  deleteSession,
  getAllSessions,
  getSessionById,
  updateSession,
} from "../api/session";
import {
  archiveStudents,
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudent,
  updateStudent,
} from "../api/students";
import { createUser, getAllUsers, getUser, updateUser } from "../api/user";
import { useAuth } from "../context/AuthContext";

// ---- result types ----

type Status = "idle" | "running" | "ok" | "forbidden" | "error";
type TestResult = { status: Status; text: string };
const IDLE: TestResult = { status: "idle", text: "—" };

const statusColor: Record<Status, string> = {
  idle: "#94a3b8",
  running: "#94a3b8",
  ok: "#16a34a",
  forbidden: "#dc2626",
  error: "#d97706",
};

const statusLabel: Record<Status, string> = {
  idle: "",
  running: "running…",
  ok: "✓",
  forbidden: "✗ 403",
  error: "⚠ error",
};

// ---- single row ----

function TestRow({
  label,
  expected,
  result,
  onRun,
  note,
}: {
  label: string;
  expected: string;
  result: TestResult;
  onRun: () => void;
  note?: string;
}) {
  return (
    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
      <td
        style={{
          padding: "0.45rem 0.75rem",
          fontFamily: "monospace",
          fontSize: "0.82rem",
          whiteSpace: "nowrap",
        }}
      >
        {label}
        {note && (
          <div
            style={{
              fontFamily: "sans-serif",
              color: "#94a3b8",
              fontSize: "0.72rem",
              fontStyle: "italic",
            }}
          >
            {note}
          </div>
        )}
      </td>
      <td style={{ padding: "0.45rem 0.75rem", color: "#64748b", fontSize: "0.78rem" }}>
        {expected}
      </td>
      <td style={{ padding: "0.45rem 0.75rem" }}>
        <button
          onClick={onRun}
          disabled={result.status === "running"}
          style={{
            padding: "0.2rem 0.65rem",
            cursor: "pointer",
            fontSize: "0.8rem",
            borderRadius: "4px",
          }}
        >
          {result.status === "running" ? "…" : "Run"}
        </button>
      </td>
      <td style={{ padding: "0.45rem 0.75rem" }}>
        <span
          style={{
            color: statusColor[result.status],
            fontSize: "0.75rem",
            fontWeight: 600,
            marginRight: "0.4rem",
          }}
        >
          {statusLabel[result.status]}
        </span>
        <span style={{ color: "#475569", fontSize: "0.75rem", wordBreak: "break-all" }}>
          {result.status !== "idle" && result.status !== "running" ? result.text : ""}
        </span>
      </td>
    </tr>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  fontSize: "0.78rem",
  color: "#475569",
  fontWeight: 600,
  borderBottom: "2px solid #e2e8f0",
};

const inputStyle: React.CSSProperties = {
  padding: "0.35rem 0.6rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.82rem",
  width: "280px",
};

// ---- table wrapper ----

function TestTable({ children }: { children: React.ReactNode }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "2rem",
        fontSize: "0.85rem",
      }}
    >
      <thead>
        <tr style={{ background: "#f8fafc", textAlign: "left" }}>
          <th style={thStyle}>Endpoint</th>
          <th style={thStyle}>Expected</th>
          <th style={thStyle}>Action</th>
          <th style={thStyle}>Result</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

// ---- main page ----

export default function TestStudentForm() {
  const { user, isAdmin, loading } = useAuth();

  // auto-filled from GET /students on load
  const [autoStudentId, setAutoStudentId] = useState("");
  const [autoSectionId, setAutoSectionId] = useState("");
  const [autoSessionId, setAutoSessionId] = useState("");

  // user-editable IDs for single-resource tests
  const [studentId, setStudentId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sessionSectionId, setSessionSectionId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otherUserId, setOtherUserId] = useState("Yn4vNEddw2UrUR4nFyJMZRPvoHp1");

  // all test results keyed by test name
  const [results, setResults] = useState<Record<string, TestResult>>({});

  useEffect(() => {
    void getAllStudents().then((r) => {
      if (r.success && r.data.length > 0) {
        const id = r.data[0]._id;
        setAutoStudentId(id);
        setStudentId((prev) => prev || id);
      }
    });
    void getAllSections().then((r) => {
      if (r.success && r.data.length > 0) {
        const id = r.data[0]._id;
        setAutoSectionId(id);
        setSectionId((prev) => prev || id);
        setSessionSectionId((prev) => prev || id);
      }
    });
    void getAllSessions().then((r) => {
      if (r.success && r.data.length > 0) {
        const id = r.data[0]._id;
        setAutoSessionId(id);
        setSessionId((prev) => prev || id);
      }
    });
  }, []);

  // helper: run a test and record its result
  function run<T>(
    key: string,
    fn: () => Promise<{ success: true; data: T } | { success: false; error: string }>,
    onSuccess: (data: T) => string,
  ) {
    setResults((prev) => ({ ...prev, [key]: { status: "running", text: "" } }));
    fn()
      .then((result) => {
        if (result.success) {
          setResults((prev) => ({
            ...prev,
            [key]: { status: "ok", text: onSuccess(result.data) },
          }));
        } else {
          const isForbidden = result.error.includes("403");
          setResults((prev) => ({
            ...prev,
            [key]: { status: isForbidden ? "forbidden" : "error", text: result.error },
          }));
        }
      })
      .catch((e: unknown) => {
        setResults((prev) => ({
          ...prev,
          [key]: { status: "error", text: e instanceof Error ? e.message : String(e) },
        }));
      });
  }

  const r = (key: string) => results[key] ?? IDLE;
  const sid = studentId || autoStudentId;

  // dummy payloads — permission middleware fires before validators/DB,
  // so a non-admin always gets 403; an admin gets the actual create/validation result
  const dummyStudent = {
    displayName: "PERM_TEST",
    meemliEmail: "perm_test@meemli.org",
    grade: 5 as const,
    schoolName: "Test School",
    city: "San Diego",
    state: "CA",
    enrolledSections: [] as string[],
    parentContact: {
      firstName: "Test",
      lastName: "Parent",
      phoneNumber: "6195550000",
      email: "parent@test.com",
    },
    preassessmentScore: 0,
    postassessmentScore: 0,
    comments: "permission test record — safe to delete",
  };

  const dummyUser = {
    firstName: "Perm",
    lastName: "Test",
    personalEmail: `perm_${Date.now()}@test.com`,
    meemliEmail: `perm_${Date.now()}@meemli.org`,
    phoneNumber: "6195550000",
    admin: false,
    assignedSections: [] as string[],
  };

  if (loading) return <p style={{ padding: "1.5rem" }}>Loading auth…</p>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1.5rem", maxWidth: "960px" }}>
      <h1 style={{ marginBottom: "0.25rem", fontSize: "1.4rem" }}>Permissions Test Panel</h1>
      <p style={{ color: "#64748b", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
        Run each API call as the current user and verify that access is granted or denied correctly.
      </p>

      {/* ---- current user badge ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem 1rem",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        {user ? (
          <>
            <span style={{ fontSize: "0.9rem" }}>
              Signed in as{" "}
              <strong>
                {user.firstName} {user.lastName}
              </strong>
            </span>
            <span
              style={{
                padding: "0.2rem 0.65rem",
                borderRadius: "9999px",
                background: isAdmin ? "#1d4ed8" : "#0891b2",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {isAdmin ? "ADMIN" : "TEACHER"}
            </span>
            <code style={{ color: "#64748b", fontSize: "0.75rem" }}>{user._id}</code>
          </>
        ) : (
          <span style={{ color: "#dc2626", fontSize: "0.9rem" }}>
            Not signed in — all requests will fail auth (401)
          </span>
        )}
      </div>

      {/* ---- shared inputs ---- */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
            Student ID
            <span style={{ fontWeight: 400, color: "#94a3b8" }}> (single-student tests)</span>
          </label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder={autoStudentId || "paste a student ObjectId"}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
            Section ID
            <span style={{ fontWeight: 400, color: "#94a3b8" }}> (section tests)</span>
          </label>
          <input
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            placeholder={autoSectionId || "paste a section ObjectId"}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
            Session's Section ID
            <span style={{ fontWeight: 400, color: "#94a3b8" }}> (POST /sessions — must exist)</span>
          </label>
          <input
            value={sessionSectionId}
            onChange={(e) => setSessionSectionId(e.target.value)}
            placeholder={autoSectionId || "paste a section ObjectId"}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
            Session ID
            <span style={{ fontWeight: 400, color: "#94a3b8" }}> (session/attendance tests)</span>
          </label>
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder={autoSessionId || "paste a session ObjectId"}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
            Other User ID
            <span style={{ fontWeight: 400, color: "#94a3b8" }}>
              {" "}
              (cross-user GET /user/:id test)
            </span>
          </label>
          <input
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
            placeholder="another user's Firebase UID"
            style={inputStyle}
          />
        </div>
      </div>

      {/* ================================================
          STUDENT CONTROLLER
      ================================================ */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Student Controller</h2>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
        Admin: full access to all students and fields.&ensp; Teacher: read &amp; edit only students
        in assigned sections; editable fields limited to <code>comments</code>,{" "}
        <code>preassessmentScore</code>, <code>postassessmentScore</code>.
      </p>

      <TestTable>
        {/* GET /students */}
        <TestRow
          label="GET /students"
          expected={isAdmin ? "200 — all students" : "200 — own-section students only"}
          result={r("s_get_all")}
          onRun={() =>
            run("s_get_all", getAllStudents, (data) => {
              console.info("GET /students response:", data);
              return `${data.length} student(s) returned`;
            })
          }
        />

        {/* GET /students/:id */}
        <TestRow
          label={`GET /students/${sid || ":id"}`}
          expected={isAdmin ? "200 — any student" : "200 if in section, 403 otherwise"}
          result={r("s_get_one")}
          note={
            !sid
              ? "Set Student ID above first"
              : !isAdmin
                ? "Teacher: verified restricted fields (displayName, grade, scores, comments, archived, enrolledSections)"
                : undefined
          }
          onRun={() => {
            if (!sid) return;
            run(
              "s_get_one",
              async () => getStudent(sid),
              (data) => {
                console.info("GET /students/:id response:", data);
                const keys = Object.keys(data);
                const restrictedKeys = [
                  "_id",
                  "displayName",
                  "grade",
                  "preassessmentScore",
                  "postassessmentScore",
                  "comments",
                  "archived",
                  "enrolledSections",
                ];
                const hasExtra = keys.some((k) => !restrictedKeys.includes(k));
                return `"${data.displayName}" ${!isAdmin && hasExtra ? "(FAILED: extra fields)" : !isAdmin ? "(PASSED: restricted)" : ""}`;
              },
            );
          }}
        />

        {/* POST /students */}
        <TestRow
          label="POST /students"
          expected={isAdmin ? "201 created (or 400 if data invalid)" : "403 Forbidden"}
          result={r("s_create")}
          note="Admin: may create a real record — delete it with DELETE /students below"
          onRun={() =>
            run(
              "s_create",
              async () => createStudent(dummyStudent),
              (data) => {
                console.info("POST /students response:", data);
                return `Created "${data.displayName}" (${data._id})`;
              },
            )
          }
        />

        {/* PUT /students/:id — teacher-allowed fields */}
        <TestRow
          label={`PUT /students/${sid || ":id"} (allowed fields)`}
          expected={isAdmin ? "200 — updated" : "200 if in section (fields comments, scores)"}
          result={r("s_edit_allowed")}
          note={
            !sid
              ? "Set Student ID above first"
              : "Sends: comments, preassessmentScore, postassessmentScore"
          }
          onRun={() => {
            if (!sid) return;
            run(
              "s_edit_allowed",
              async () =>
                updateStudent({
                  _id: sid,
                  comments: `perm_check_${Date.now()}`,
                  preassessmentScore: 42,
                  postassessmentScore: 84,
                } as Parameters<typeof updateStudent>[0]),
              (data) => {
                console.info("PUT /students/:id (allowed fields) response:", data);
                return `OK — grade=${data.grade}, comments="${data.comments}"`;
              },
            );
          }}
        />

        {/* PUT /students/:id — restricted field */}
        <TestRow
          label={`PUT /students/${sid || ":id"} (restricted field)`}
          expected={
            isAdmin
              ? "200 — grade updated to 12 (admin: all fields allowed)"
              : "200 — grade unchanged (teacher: field silently stripped)"
          }
          result={r("s_edit_restricted")}
          note={
            !sid
              ? "Set Student ID above first"
              : "Sends grade=12; teacher result shows original grade"
          }
          onRun={() => {
            if (!sid) return;
            run(
              "s_edit_restricted",
              async () =>
                updateStudent({
                  _id: sid,
                  grade: 12,
                } as Parameters<typeof updateStudent>[0]),
              (data) => {
                console.info("PUT /students/:id (restricted field) response:", data);
                return `returned grade=${data.grade} ${data.grade === 999 ? "(admin — field applied)" : "(teacher — field stripped)"}`;
              },
            );
          }}
        />

        {/* DELETE /students/:id */}
        <TestRow
          label={`DELETE /students/${sid || ":id"}`}
          expected={isAdmin ? "200 — deleted" : "403 Forbidden"}
          result={r("s_delete")}
          note={!sid ? "Set Student ID above first" : "Admin: this permanently deletes the record"}
          onRun={() => {
            if (!sid) return;
            run(
              "s_delete",
              async () => deleteStudent(sid),
              (data) => {
                console.info("DELETE /students/:id response:", data);
                return data.message;
              },
            );
          }}
        />

        {/* PUT /students/archive */}
        <TestRow
          label="PUT /students/archive"
          expected={isAdmin ? "200 — archived" : "403 Forbidden"}
          result={r("s_archive")}
          onRun={() => {
            if (!sid) return;
            run(
              "s_archive",
              async () => archiveStudents([sid], true),
              (data) => {
                console.info("PUT /students/archive response:", data);
                return `Archived ${data.length} student(s)`;
              },
            );
          }}
        />
      </TestTable>

      {/* ================================================
          SECTION CONTROLLER
      ================================================ */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Section Controller</h2>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
        Admin: full access.&ensp; Teacher: GET actions on assigned sections only; all mutating
        operations return 403.
      </p>

      <TestTable>
        {/* GET /sections */}
        <TestRow
          label="GET /sections"
          expected={isAdmin ? "200 — all sections" : "200 — assigned sections only"}
          result={r("sec_get_all")}
          onRun={() =>
            run("sec_get_all", getAllSections, (data) => {
              console.info("GET /sections response:", data);
              return `${data.length} section(s) returned`;
            })
          }
        />

        {/* GET /sections/:id */}
        <TestRow
          label={`GET /sections/${sectionId || ":id"}`}
          expected={isAdmin ? "200 — any section" : "200 if assigned, 403 otherwise"}
          result={r("sec_get_one")}
          onRun={() => {
            if (!sectionId) return;
            run(
              "sec_get_one",
              async () => getSectionById(sectionId),
              (data) => {
                console.info("GET /sections/:id response:", data);
                return `"${data.code}"`;
              },
            );
          }}
        />

        {/* POST /sections */}
        <TestRow
          label="POST /sections"
          expected={isAdmin ? "201 created" : "403 Forbidden"}
          result={r("sec_create")}
          onRun={() =>
            run(
              "sec_create",
              async () =>
                createSection({
                  code: "PERM_TEST",
                  teachers: [],
                  enrolledStudents: [],
                  startTime: "09:00",
                  endTime: "10:00",
                  startDate: "2026-05-01",
                  endDate: "2026-06-01",
                  archived: false,
                  color: "#ff00ff",
                  days: ["Monday"],
                }),
              (data) => {
                console.info("POST /sections response:", data);
                return `Created "${data.code}" (${data._id})`;
              },
            )
          }
        />

        {/* PUT /sections/:id */}
        <TestRow
          label={`PUT /sections/${sectionId || ":id"}`}
          expected={isAdmin ? "200 — updated" : "403 Forbidden"}
          result={r("sec_edit")}
          onRun={() => {
            if (!sectionId) return;
            run(
              "sec_edit",
              async () => {
                const current = await getSectionById(sectionId);
                if (!current.success) return current;
                return updateSection({ ...current.data, code: "UPDATED" });
              },
              (data) => {
                console.info("PUT /sections/:id response:", data);
                return `"${data.code}" updated`;
              },
            );
          }}
        />

        {/* DELETE /sections/:id */}
        <TestRow
          label={`DELETE /sections/${sectionId || ":id"}`}
          expected={isAdmin ? "204 — deleted" : "403 Forbidden"}
          result={r("sec_delete")}
          onRun={() => {
            if (!sectionId) return;
            run(
              "sec_delete",
              async () => deleteSection(sectionId),
              (data) => {
                console.info("DELETE /sections/:id response:", data);
                return "Deleted";
              },
            );
          }}
        />
      </TestTable>

      {/* ================================================
          SESSION CONTROLLER
      ================================================ */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Session Controller</h2>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
        Admin: full access.&ensp; Teacher: GET actions on assigned sessions only; all mutating
        operations return 403.
      </p>

      <TestTable>
        {/* GET /sessions */}
        <TestRow
          label="GET /sessions"
          expected={isAdmin ? "200 — all sessions" : "200 — assigned sessions only"}
          result={r("ses_get_all")}
          onRun={() =>
            run("ses_get_all", getAllSessions, (data) => {
              console.info("GET /sessions response:", data);
              return `${data.length} session(s) returned`;
            })
          }
        />

        {/* GET /sessions/:id */}
        <TestRow
          label={`GET /sessions/${sessionId || ":id"}`}
          expected={isAdmin ? "200 — any session" : "200 if assigned, 403 otherwise"}
          result={r("ses_get_one")}
          onRun={() => {
            if (!sessionId) return;
            run(
              "ses_get_one",
              async () => getSessionById(sessionId),
              (data) => {
                console.info("GET /sessions/:id response:", data);
                return `Session on ${data.sessionDate}`;
              },
            );
          }}
        />

        {/* POST /sessions */}
        <TestRow
          label="POST /sessions"
          expected={isAdmin ? "201 created" : "403 Forbidden"}
          result={r("ses_create")}
          onRun={() =>
            run(
              "ses_create",
              async () =>
                createSession({
                  section: sessionSectionId,
                  sessionDate: "2026-05-01",
                }),
              (data) => {
                console.info("POST /sessions response:", data);
                return `Created session (${data._id})`;
              },
            )
          }
        />

        {/* PUT /sessions/:id */}
        <TestRow
          label={`PUT /sessions/${sessionId || ":id"}`}
          expected={isAdmin ? "200 — updated" : "403 Forbidden"}
          result={r("ses_edit")}
          onRun={() => {
            if (!sessionId) return;
            run(
              "ses_edit",
              async () => {
                const current = await getSessionById(sessionId);
                if (!current.success) return current;
                return updateSession({ ...current.data, sessionDate: "2026-05-02" });
              },
              (data) => {
                console.info("PUT /sessions/:id response:", data);
                return "Updated";
              },
            );
          }}
        />

        {/* DELETE /sessions/:id */}
        <TestRow
          label={`DELETE /sessions/${sessionId || ":id"}`}
          expected={isAdmin ? "204 — deleted" : "403 Forbidden"}
          result={r("ses_delete")}
          onRun={() => {
            if (!sessionId) return;
            run(
              "ses_delete",
              async () => deleteSession(sessionId),
              (data) => {
                console.info("DELETE /sessions/:id response:", data);
                return "Deleted";
              },
            );
          }}
        />
      </TestTable>

      {/* ================================================
          ATTENDANCE CONTROLLER
      ================================================ */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Attendance Controller</h2>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
        Admin: full access.&ensp; Teacher: full permissions on attendances for assigned sections.
      </p>

      <TestTable>
        {/* GET /attendance/session/:sessionId */}
        <TestRow
          label={`GET /attendance/session/${sessionId || ":id"}`}
          expected={isAdmin ? "200 — any session" : "200 if assigned, 403 otherwise"}
          result={r("att_get")}
          onRun={() => {
            if (!sessionId) return;
            run(
              "att_get",
              async () => getAttendanceBySessionId(sessionId),
              (data) => {
                console.info("GET /attendance response:", data);
                return `${data.length} records`;
              },
            );
          }}
        />

        {/* PUT /attendance/bulk-update */}
        <TestRow
          label="PUT /attendance/bulk-update"
          expected={isAdmin ? "200 — updated" : "200 if assigned, 403 otherwise"}
          result={r("att_edit")}
          onRun={() => {
            run(
              "att_edit",
              async () => updateAttendanceBulk([]),
              (data) => {
                console.info("PUT /attendance/bulk-update response:", data);
                return data.message;
              },
            );
          }}
        />
      </TestTable>

      {/* ================================================
          USER CONTROLLER
      ================================================ */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>User Controller</h2>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
        Admin: full access.&ensp; Teacher: only <code>GET /user/:id</code> for their own ID
        (whoAmI); all other routes return 403.
      </p>

      <TestTable>
        {/* GET /user */}
        <TestRow
          label="GET /user"
          expected={isAdmin ? "200 — all users" : "403 Forbidden"}
          result={r("u_get_all")}
          onRun={() =>
            run("u_get_all", getAllUsers, (data) => {
              console.info("GET /user response:", data);
              return `${data.length} user(s) returned`;
            })
          }
        />

        {/* GET /user/:id — self */}
        <TestRow
          label={`GET /user/${user?._id ?? ":id"} (self)`}
          expected="200 — own profile (allowed for admin and teacher)"
          result={r("u_get_self")}
          note={!user ? "Sign in first" : undefined}
          onRun={() => {
            if (!user) return;
            run(
              "u_get_self",
              async () => getUser(user._id),
              (data) => {
                console.info("GET /user/:id (self) response:", data);
                return `"${data.firstName} ${data.lastName}", admin=${String(data.admin)}`;
              },
            );
          }}
        />

        {/* GET /user/:id — other user */}
        <TestRow
          label={`GET /user/${otherUserId || ":otherId"} (other user)`}
          expected={isAdmin ? "200 — any user's profile" : "403 Forbidden"}
          result={r("u_get_other")}
          note={!otherUserId ? "Set Other User ID above first" : undefined}
          onRun={() => {
            if (!otherUserId) return;
            run(
              "u_get_other",
              async () => getUser(otherUserId),
              (data) => {
                console.info("GET /user/:id (other) response:", data);
                return `"${data.firstName} ${data.lastName}"`;
              },
            );
          }}
        />

        {/* POST /user */}
        <TestRow
          label="POST /user"
          expected={isAdmin ? "201 created (Firebase + DB)" : "403 Forbidden"}
          result={r("u_create")}
          note="Admin: creates a real Firebase + DB user record"
          onRun={() =>
            run(
              "u_create",
              async () => createUser(dummyUser),
              (data) => {
                console.info("POST /user response:", data);
                return `Created "${data.firstName} ${data.lastName}" (${data._id})`;
              },
            )
          }
        />

        {/* PUT /user/:id — self */}
        <TestRow
          label={`PUT /user/${user?._id ?? ":id"} (self)`}
          expected={isAdmin ? "200 — updated" : "403 Forbidden"}
          result={r("u_edit_self")}
          note={
            !user
              ? "Sign in first"
              : "Sends a no-op update (same phoneNumber) to avoid real changes"
          }
          onRun={() => {
            if (!user) return;
            run(
              "u_edit_self",
              async () => updateUser({ ...user, phoneNumber: user.phoneNumber }),
              (data) => {
                console.info("PUT /user/:id (self) response:", data);
                return `"${data.firstName} ${data.lastName}" updated`;
              },
            );
          }}
        />
      </TestTable>
    </div>
  );
}
