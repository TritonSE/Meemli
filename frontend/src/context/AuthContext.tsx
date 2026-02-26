import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../util/firebase";
import { User as APIUser, getUser, createUser } from "../api/user";

interface AuthContextType {
  user: APIUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true); // Ensure we show loading when state starts changing
        
        try {
        if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            const result = await getUser(firebaseUser.uid, token);
            
            if (result.success) {
            setUser(result.data);
            } else if (result.error?.toLowerCase().includes("404")) {
            // Handle creation logic
            const createRes = await createUser(payload, token);
            if (createRes.success) setUser(createRes.data);
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

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
