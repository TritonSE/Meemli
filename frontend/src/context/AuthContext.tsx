import { onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { getUser } from "../api/user";
import { auth } from "../util/firebase";

import type { User as APIUser } from "../api/user";

type AuthContextType = {
  user: APIUser | null;
  loading: boolean;
  /**
   * Signs the current user out of Firebase and clears the cached profile.
   * Components can call this when the user clicks a logout button.
   */
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(true);

  // expose a logout function via context so any component can sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error during logout", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Ensure we show loading when state starts changing

      try {
        if (firebaseUser) {
          const result = await getUser(firebaseUser.uid);

          if (result.success) {
            setUser(result.data);
          } else if (result.error?.toLowerCase().includes("404")) {
            // TODO: construct payload from firebaseUser or prompt user to finish
            // const createRes = await createUser(payload);
            // if (createRes.success) setUser(createRes.data);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
