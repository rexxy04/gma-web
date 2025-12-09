import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "@/lib/firebase/firebase"; // Config utama
import { UserProfile } from "@/lib/types/firestore";

// Helper: Konfigurasi Firebase (Ambil dari Environment)
// Pastikan variable environment ini tersedia di browser
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * MENGAMBIL DATA WARGA (READ)
 */
export async function getResidents(): Promise<UserProfile[]> {
  try {
    // Ambil user yang role-nya 'resident'
    const q = query(
      collection(db, "users"), 
      where("role", "==", "resident"),
      orderBy("displayName", "asc") // Urutkan A-Z (perlu index composite nanti jika error)
    );
    
    // Fallback jika belum ada index: hapus orderBy dulu saat testing awal
    // const q = query(collection(db, "users"), where("role", "==", "resident"));

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserProfile));
  } catch (error) {
    console.error("Gagal mengambil data warga:", error);
    throw error;
  }
}

/**
 * MENAMBAH WARGA BARU (CREATE)
 * Menggunakan teknik Secondary App agar Admin tidak ter-logout
 */
export async function createResident(data: {
  email: string;
  name: string;
  phone: string;
  block: string;
  number: string;
  password: string; // Password sementara
}) {
  // 1. Buat App Instance Kedua (Temporary)
  const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // 2. Buat User di Auth (menggunakan App Kedua)
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      data.email, 
      data.password
    );
    const newUid = userCredential.user.uid;

    // 3. Logout dari App Kedua (Hanya jaga-jaga)
    await signOut(secondaryAuth);

    // 4. Simpan Profil Lengkap ke Firestore (Menggunakan App Utama/Admin)
    //    Kita simpan di collection 'users' dengan ID = UID dari Auth
    await setDoc(doc(db, "users", newUid), {
      uid: newUid,
      email: data.email,
      displayName: data.name,
      role: "resident", // Wajib set sebagai warga
      phoneNumber: data.phone,
      houseBlock: data.block,
      houseNumber: data.number,
      createdAt: Date.now(),
    });

    return newUid;

  } catch (error: any) {
    console.error("Gagal membuat warga:", error);
    throw error;
  } finally {
    // 5. Hancurkan App Kedua agar hemat memori
    await deleteApp(secondaryApp);
  }
}