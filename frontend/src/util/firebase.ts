import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
