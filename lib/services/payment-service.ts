import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Payment, PaymentStatus } from "@/lib/types/firestore";

const COLLECTION_NAME = "payments";

/**
 * MENGAMBIL PEMBAYARAN PENDING (Untuk Halaman Verifikasi)
 */
export async function getPendingPayments(): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc") // Yang baru upload ada di atas
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Payment));
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return [];
  }
}

/**
 * MENGAMBIL RIWAYAT PEMBAYARAN SUKSES (Untuk Halaman Pemasukan)
 */
export async function getSuccessPayments(): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "success"),
      orderBy("year", "desc"),
      orderBy("month", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Payment));
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
}

/**
 * UPDATE STATUS PEMBAYARAN (Terima/Tolak)
 */
export async function verifyPayment(paymentId: string, isApproved: boolean, adminId: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    await updateDoc(docRef, {
      status: isApproved ? "success" : "failed",
      verifiedBy: adminId,
      verifiedAt: serverTimestamp(), // Field baru untuk audit trail
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
}

/**
 * CATAT PEMBAYARAN MANUAL (TUNAI)
 * Fitur admin untuk mencatat warga yang bayar cash/titip
 */
export async function createManualPayment(data: {
  userId: string;
  amount: number;
  month: number;
  year: number;
  adminId: string;
}) {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      userId: data.userId,
      amount: data.amount,
      month: data.month,
      year: data.year,
      status: "success", // Langsung sukses karena manual/tunai
      paymentMethod: "cash_manual",
      verifiedBy: data.adminId,
      createdAt: Date.now(), // Pakai Date.now() agar konsisten dengan tipe number di interface
    });
  } catch (error) {
    console.error("Error creating manual payment:", error);
    throw error;
  }
}