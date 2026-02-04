const admin = require("firebase-admin");

const { PORT, serviceAccountKey, FIREBASE_API_KEY } = require("../../dist/config");

const BASE_URL = `http://localhost:${PORT}`;

/**
 * Aa per-path test matrix for each endpoint to be tested with multiple HTTP methods.
 * - methods: which verbs to run for this path
 * - body: optional JSON payload for POST/PUT/PATCH (or any method)
 */
const TEST_MATRIX = [
  // GET /api/program
  { path: "/api/program", methods: ["GET"] },

  // GET /api/program/:id
  // { path: "/api/program/69714740ebe400a70cee78b4", methods: ["GET"] },

  // GET /students
  // { path: "/students", methods: ["GET"] },

  // POST /students
  // {
  //   path: "/students",
  //   methods: ["POST"],
  //   body: {
  //     parentContact: {
  //       firstName: "Test",
  //       lastName: "Parent",
  //       phoneNumber: 5555555555,
  //       email: "test.parent@example.com",
  //     },
  //     displayName: "Middleware Test Student",
  //     meemliEmail: "middleware.test@student.example.com",
  //     grade: 11,
  //     schoolName: "UCSD",
  //     city: "San Diego",
  //     state: "California",
  //     preassessmentScore: 87,
  //     postassessmentScore: 94,
  //     enrolledSections: [],
  //     comments: "Created by middleware auth test script",
  //   },
  // },

  // PUT /students/:id
  // {
  //   path: "/students/697dd1672128314dc3583699",
  //   methods: ["PUT"],
  //   body: {
  //     comments: "Updated by middleware auth test script",
  //   },
  // },

  // DELETE /students/:id
  // {
  //   path: "/students/697dd1672128314dc3583699",
  //   methods: ["DELETE"],
  // },
];

function parseServiceAccount(raw) {
  const trimmed = String(raw).trim();
  return trimmed.startsWith("{") ? JSON.parse(trimmed) : require(trimmed);
}

/**
 * Performs an HTTP request and tries to JSON-parse the response body
 * If parsing fails, returns the raw text body
 */
async function httpRequest(method, fullUrl, opts = {}) {
  const { headers = {}, json, raw, query } = opts;

  const u = new URL(fullUrl);

  // Optional query string helper (nice for endpoints like /resource?id=123)
  if (query && typeof query === "object") {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      u.searchParams.set(k, String(v));
    }
  }

  const finalHeaders = { ...headers };
  let body;

  if (json !== undefined) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] ?? "application/json";
    body = JSON.stringify(json);
  } else if (raw !== undefined) {
    body = raw;
  }

  const res = await fetch(u.toString(), { method, headers: finalHeaders, body });
  const text = await res.text();
  let parsed = text;
  try {
    parsed = JSON.parse(text);
  } catch {}
  return { status: res.status, body: parsed };
}

/**
 * Standardized console output formatting for each test case
 */
function logResult(name, method, fullUrl, r) {
  console.info(`\n=== ${name} ===`);
  console.info(`${method} ${fullUrl}`);
  console.info(`Status: ${r.status}`);
  console.info("Body:", r.body);
}

/**
 * Convert each candidate path into an absolute URL under BASE_URL
 * Returns array like: [{ path: "/test", url: "http://localhost:4000/test" }, ...]
 */
function getUrls() {
  return TEST_MATRIX.map((t) => ({
    ...t,
    url: new URL(t.path, BASE_URL).toString(),
  }));
}

/**
 * Ensures a Firebase Auth user exists (by uid) so we can mint a custom token for them
 * If the user does not exist, it creates them
 */
async function ensureUser(uid) {
  try {
    await admin.auth().getUser(uid);
    return;
  } catch (e) {
    // Firebase Admin throws "auth/user-not-found" if missing
    if (e?.code !== "auth/user-not-found") throw e;
  }
  await admin.auth().createUser({ uid });
  console.info(`Created Firebase Auth test user uid="${uid}"`);
}

/**
 * Firebase Admin can create a custom token, but most backends expect an ID token
 * This exchanges the custom token for an ID token using the Identity Toolkit API endpoint
 */
async function exchangeCustomTokenForIdToken(customToken) {
  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(
    FIREBASE_API_KEY,
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data.idToken;
}

/**
 * Runs the full suite of auth tests for a single (method, url)
 *   - No auth header (should fail)
 *   - Malformed header (should fail)
 *   - Invalid token (should fail)
 *   - Valid token (should pass)
 */
async function runTestsForMethod({ path, url, body }, method, idToken) {
  console.info("\n==============================");
  console.info("Testing path:", path);
  console.info("Using URL:", url);
  console.info("HTTP method:", method);

  // Helper to keep the 4 test cases consistent across all verbs
  const makeReq = (headers) =>
    httpRequest(method, url, {
      headers,
      json:
        body !== undefined
          ? body
          : method === "POST" || method === "PUT" || method === "PATCH"
            ? { _test: true } // default placeholder so you can see behavior
            : undefined,
    });

  // negative tests
  const noAuth = await makeReq({});
  logResult("No Authorization header", method, url, noAuth);

  const malformed = await makeReq({ Authorization: "Bear tokenwithoutspace" });
  logResult("Malformed Authorization header", method, url, malformed);

  const invalid = await makeReq({ Authorization: "Bearer not.a.real.token" });
  logResult("Invalid token", method, url, invalid);

  // positive test
  const valid = await makeReq({ Authorization: `Bearer ${idToken}` });
  logResult("Valid Firebase ID token (should PASS)", method, url, valid);
}

(async () => {
  // Boot Firebase Admin using the service account (server-side credentials)
  const serviceAccount = parseServiceAccount(serviceAccountKey);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  // Create (or reuse) a test user and mint a valid ID token once
  const TEST_UID = "middleware_test_user";
  await ensureUser(TEST_UID);

  const customToken = await admin.auth().createCustomToken(TEST_UID);
  const idToken = await exchangeCustomTokenForIdToken(customToken);

  // Optional debugging helpers to confirm the ID token matches the project
  /*
  function decodeJwtPayload(jwt) {
    const [, p] = jwt.split(".");
    return JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  }
  const payload = decodeJwtPayload(idToken);
  console.log("Token aud:", payload.aud);
  console.log("Token iss:", payload.iss);
  console.log("Token sub:", payload.sub);
  console.log("Service account project_id:", serviceAccount.project_id);
  */

  // Build a flat list of tasks (each task runs one method against one URL).
  // IMPORTANT: This avoids `await` inside a loop (eslint: no-await-in-loop),
  // while still running tests in a predictable, sequential order.
  const urls = getUrls();

  const tasks = urls.flatMap((u) =>
    (u.methods ?? []).map((method) => () => runTestsForMethod(u, method, idToken)),
  );

  // Run sequentially via promise chaining (no await-in-loop).
  await tasks.reduce((p, task) => p.then(task), Promise.resolve());
})().catch((e) => {
  // Any unhandled error ends the script with a non-zero exit code (useful for CI).
  console.error("Fatal error:", e?.message ?? e);
  process.exit(1);
});

/* Alternatively, you can also use curl to test, e.g.:
curl -i -H "Authorization: Bearer <TOKEN_HERE>" \
  http://localhost:4000/api/program
*/
