const admin = require("firebase-admin");

const { PORT, serviceAccountKey, FIREBASE_API_KEY } = require("../../dist/config");

const BASE_URL = `http://localhost:${PORT}`;
// const PATHS_TO_TEST = ["/test", "/api/program", "/students", "/api/sessions"]; // add paths to test here!
const PATHS_TO_TEST = [ "/students"]; // add paths to test here!


function parseServiceAccount(raw) {
  const trimmed = String(raw).trim();
  return trimmed.startsWith("{") ? JSON.parse(trimmed) : require(trimmed);
}

/**
 * Performs a GET request and tries to JSON-parse the response body
 * If parsing fails, returns the raw text body
 */
async function httpGet(fullUrl, headers = {}) {
  const res = await fetch(fullUrl, { method: "GET", headers });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {}
  return { status: res.status, body };
}

/**
 * Standardized console output formatting for each test case
 */
function logResult(name, fullUrl, r) {
  console.info(`\n=== ${name} ===`);
  console.info(`GET ${fullUrl}`);
  console.info(`Status: ${r.status}`);
  console.info("Body:", r.body);
}

/**
 * Convert each candidate path into an absolute URL under BASE_URL
 * Returns array like: [{ path: "/test", url: "http://localhost:4000/test" }, ...]
 */
function getUrls() {
  return PATHS_TO_TEST.map((p) => ({
    path: p,
    url: new URL(p, BASE_URL).toString(),
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
  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(FIREBASE_API_KEY)}`;

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
 * Runs the full suite of auth tests for a single URL
 *   - No auth header (should fail)
 *   - Malformed header (should fail)
 *   - Invalid token (should fail)
 *   - Valid token (should pass)
 */
async function runTestsForUrl({ path, url }, idToken) {
  console.info("\n==============================");
  console.info("Testing path:", path);
  console.info("Using URL:", url);

  // negative tests
  const noAuth = await httpGet(url);
  logResult("No Authorization header", url, noAuth);

  const malformed = await httpGet(url, { Authorization: "Bear tokenwithoutspace" });
  logResult("Malformed Authorization header", url, malformed);

  const invalid = await httpGet(url, { Authorization: "Bearer not.a.real.token" });
  logResult("Invalid token", url, invalid);

  // positive test
  const valid = await httpGet(url, { Authorization: `Bearer ${idToken}` });
  logResult("Valid Firebase ID token (should PASS)", url, valid);
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

  // Run tests sequentially for each URL
  const urls = getUrls();
  await urls.reduce((p, u) => p.then(() => runTestsForUrl(u, idToken)), Promise.resolve());
})().catch((e) => {
  // Any unhandled error ends the script with a non-zero exit code (useful for CI).
  console.error("Fatal error:", e?.message ?? e);
  process.exit(1);
});

/* Alternatively, you can also use curl to test, e.g.: 
curl -i -H "Authorization: Bearer <TOKEN_HERE>" \
  http://localhost:4000/test
*/
