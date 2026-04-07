import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9fIXfDllUVyDZccNeElVSp6308fTwAJk",
  authDomain: "meemli-dev.firebaseapp.com",
  projectId: "meemli-dev",
  storageBucket: "meemli-dev.firebasestorage.app",
  messagingSenderId: "503836608250",
  appId: "1:503836608250:web:b7d8e7b7585cf3b096ab43",
  measurementId: "G-GV7CVH52RM",
} as const;

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };

// ----------- Teacher Activation Email

/**
 * Sends a Meemli activation email via Firebase.
 */
export const sendMeemliActivationEmail = async (
  email: string,
  inviterName: string = "An Admin",
) => {
  // Ensures we don't break during Next.js Server Side Rendering
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://meemli.com";

  const actionCodeSettings = {
    // custom Next.js route
    url: `${baseUrl}/activate?inviter=${encodeURIComponent(inviterName)}&email=${encodeURIComponent(email)}`,
    handleCodeInApp: false,
  };

  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    console.error("Firebase Auth Error:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
};
