"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  User 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebase"; // Pastikan path ini benar
import { UserProfile, UserRole } from "@/lib/types/firestore";

// Tipe data Context
interface AuthContextType {
  user: UserProfile | null;     // Data user lengkap (Auth + Firestore)
  firebaseUser: User | null;    // Object user mentah dari Firebase Auth
  isLoading: boolean;           // Status loading cek sesi
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. LISTENER: Memantau perubahan status login (Realtime)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      
      if (currentUser) {
        setFirebaseUser(currentUser);
        
        // Ambil data tambahan (Role dll) dari Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as UserProfile;
            // Gabungkan data auth + data firestore
            setUser({
              ...userData,
              uid: currentUser.uid,
              email: currentUser.email || "",
            });
          } else {
            // Fallback jika user ada di Auth tapi tidak ada di Firestore (Jaga-jaga)
            console.warn("User authenticated but no Firestore profile found.");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        // User logout
        setFirebaseUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. FUNGSI LOGIN
  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // Listener useEffect di atas akan otomatis jalan setelah ini sukses
    } catch (error: any) {
      // Kita lempar error agar bisa ditangkap oleh UI (LoginModal) untuk menampilkan pesan
      throw error;
    }
  };

  // 3. FUNGSI LOGOUT
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}