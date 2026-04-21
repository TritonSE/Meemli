import { useEffect, useState } from "react";

import {
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
      <td style={{ padding: "0.45rem 0.75rem", fontFamily: "monospace", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
        {label}
        {note && <div style={{ fontFamily: "sans-serif", color: "#94a3b8", fontSize: "0.72rem", fontStyle: "italic" }}>{note}</div>}
      </td>
      <td style={{ padding: "0.45rem 0.75rem", color: "#64748b", fontSize: "0.78rem" }}>{expected}</td>
      <td style={{ padding: "0.45rem 0.75rem" }}>
        <button
          onClick={onRun}
          disabled={result.status === "running"}
          style={{ padding: "0.2rem 0.65rem", cursor: "pointer", fontSize: "0.8rem", borderRadius: "4px" }}
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

// ---- table wrapper ----

function TestTable({ children }: { children: React.ReactNode }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem", fontSize: "0.85rem" }}>
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

const thStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  fontSize: "0.78rem",
  color: "#475569",
  fontWeight: 600,
  borderBottom: "2px solid #e2e8f0",
};

// ---- main page ----

export default function TestStudentForm() {
  const { user, isAdmin, loading } = useAuth();

  // auto-filled from GET /students on load
  const [autoStudentId, setAutoStudentId] = useState("");

  // user-editable IDs for single-resource tests
  const [studentId, setStudentId] = useState("");
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
          setResults((prev) => ({ ...prev, [key]: { status: "ok", text: onSuccess(result.data) } }));
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
    parentContact: { firstName: "Test", lastName: "Parent", phoneNumber: "6195550000", email: "parent@test.com" },
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
              Signed in as <strong>{user.firstName} {user.lastName}</strong>
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
          {autoStudentId && (
            <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
              Auto-filled from GET /students
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
            Other User ID
            <span style={{ fontWeight: 400, color: "#94a3b8" }}> (cross-user GET /user/:id test)</span>
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
        Admin: full access to all students and fields.&ensp;
        Teacher: read &amp; edit only students in assigned sections;
        editable fields limited to <code>comments</code>, <code>preassessmentScore</code>,{" "}
        <code>postassessmentScore</code>.
      </p>

      <TestTable>
        {/* GET /students */}
        <TestRow
          label="GET /students"
          expected={isAdmin ? "200 — all students" : "200 — own-section students only"}
          result={r("s_get_all")}
          onRun={() =>
            run("s_get_all", getAllStudents, (data) => {
              console.log("GET /students response:", data);
              return `${data.length} student(s) returned`;
            })
          }
        />

        {/* GET /students/:id */}
        <TestRow
          label={`GET /students/${sid || ":id"}`}
          expected={isAdmin ? "200 — any student" : "200 if in section, 403 otherwise"}
          result={r("s_get_one")}
          note={!sid ? "Set Student ID above first" : undefined}
          onRun={() => {
            if (!sid) return;
            run("s_get_one", () => getStudent(sid), (data) => {
              console.log("GET /students/:id response:", data);
              return `"${data.displayName}"`;
            });
          }}
        />

        {/* POST /students */}
        <TestRow
          label="POST /students"
          expected={isAdmin ? "201 created (or 400 if data invalid)" : "403 Forbidden"}
          result={r("s_create")}
          note="Admin: may create a real record — delete it with DELETE /students below"
          onRun={() =>
            run("s_create", () => createStudent(dummyStudent), (data) => {
              console.log("POST /students response:", data);
              return `Created "${data.displayName}" (${data._id})`;
            })
          }
        />

        {/* PUT /students/:id — teacher-allowed fields */}
        <TestRow
          label={`PUT /students/${sid || ":id"} (allowed fields)`}
          expected={isAdmin ? "200 — updated" : "200 if in section (fields comments, scores)"}
          result={r("s_edit_allowed")}
          note={!sid ? "Set Student ID above first" : "Sends: comments, preassessmentScore, postassessmentScore"}
          onRun={() => {
            if (!sid) return;
            run(
              "s_edit_allowed",
              () =>
                updateStudent({
                  _id: sid,
                  comments: `perm_check_${Date.now()}`,
                  preassessmentScore: 42,
                  postassessmentScore: 84,
                } as Parameters<typeof updateStudent>[0]),
              (data) => {
                console.log("PUT /students/:id (allowed fields) response:", data);
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
          note={!sid ? "Set Student ID above first" : "Sends grade=12; teacher result shows original grade"}
          onRun={() => {
            if (!sid) return;
            run(
              "s_edit_restricted",
              () =>
                updateStudent({
                  _id: sid,
                  grade: 12,
                } as Parameters<typeof updateStudent>[0]),
              (data) => {
                console.log("PUT /students/:id (restricted field) response:", data);
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
            run("s_delete", () => deleteStudent(sid), (data) => {
              console.log("DELETE /students/:id response:", data);
              return data.message;
            });
          }}
        />
      </TestTable>

      {/* ================================================
          USER CONTROLLER
      ================================================ */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>User Controller</h2>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
        Admin: full access.&ensp;
        Teacher: only <code>GET /user/:id</code> for their own ID (whoAmI); all other routes return 403.
      </p>

      <TestTable>
        {/* GET /user */}
        <TestRow
          label="GET /user"
          expected={isAdmin ? "200 — all users" : "403 Forbidden"}
          result={r("u_get_all")}
          onRun={() =>
            run("u_get_all", getAllUsers, (data) => {
              console.log("GET /user response:", data);
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
            run("u_get_self", () => getUser(user._id), (data) => {
              console.log("GET /user/:id (self) response:", data);
              return `"${data.firstName} ${data.lastName}", admin=${String(data.admin)}`;
            });
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
            run("u_get_other", () => getUser(otherUserId), (data) => {
              console.log("GET /user/:id (other) response:", data);
              return `"${data.firstName} ${data.lastName}"`;
            });
          }}
        />

        {/* POST /user */}
        <TestRow
          label="POST /user"
          expected={isAdmin ? "201 created (Firebase + DB)" : "403 Forbidden"}
          result={r("u_create")}
          note="Admin: creates a real Firebase + DB user record"
          onRun={() =>
            run("u_create", () => createUser(dummyUser), (data) => {
              console.log("POST /user response:", data);
              return `Created "${data.firstName} ${data.lastName}" (${data._id})`;
            })
          }
        />

        {/* PUT /user/:id — self */}
        <TestRow
          label={`PUT /user/${user?._id ?? ":id"} (self)`}
          expected={isAdmin ? "200 — updated" : "403 Forbidden"}
          result={r("u_edit_self")}
          note={!user ? "Sign in first" : "Sends a no-op update (same phoneNumber) to avoid real changes"}
          onRun={() => {
            if (!user) return;
            run(
              "u_edit_self",
              () => updateUser({ ...user, phoneNumber: user.phoneNumber }),
              (data) => {
                console.log("PUT /user/:id (self) response:", data);
                return `"${data.firstName} ${data.lastName}" updated`;
              },
            );
          }}
        />
      </TestTable>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.35rem 0.6rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.82rem",
  width: "280px",
};
