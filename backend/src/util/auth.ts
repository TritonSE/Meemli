/**
 * This file consists of functions to be used to manage or decode firebase users
 */

import { AuthError } from "../errors/auth";

import { firebaseAdminAuth } from "./firebase";

async function createSessionCookieFromIdToken(idToken: string, expiresInMs: number) {
  // Verify ID token first (ensures it's legit)
  await firebaseAdminAuth.verifyIdToken(idToken);
  return firebaseAdminAuth.createSessionCookie(idToken, { expiresIn: expiresInMs });
}

async function decodeAuthToken(token: string) {
  try {
    const userInfo = await firebaseAdminAuth.verifyIdToken(token);
    return userInfo;
  } catch (e) {
    console.error(e);
    throw AuthError.DECODE_ERROR;
  }
}

async function verifySessionCookie(sessionCookie: string) {
  // checkRevoked=true is stronger security, but requires extra call
  return firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
}

export { createSessionCookieFromIdToken, decodeAuthToken, verifySessionCookie };
