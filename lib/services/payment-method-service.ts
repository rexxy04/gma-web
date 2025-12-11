import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";
import { PaymentMethod } from "@/lib/types/firestore";

const COLLECTION = "payment_methods";

/**
 * PUBLIC: AMBIL SEMUA METODE PEMBAYARAN AKTIF
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const q = query(collection(db, COLLECTION), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentMethod));
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
}

/**
 * ADMIN: SIMPAN METODE BARU / EDIT
 */
export async function savePaymentMethod(
  data: Partial<PaymentMethod>,
  qrisFile: File | null
) {
  try {
    const docId = data.id || doc(collection(db, COLLECTION)).id;
    let qrisUrl = data.qrisImageUrl || "";

    // Upload QRIS jika ada file baru dan tipe adalah QRIS
    if (data.type === 'qris' && qrisFile) {
      const storageRef = ref(storage, `payment_methods/${docId}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, qrisFile);
      qrisUrl = await getDownloadURL(snapshot.ref);
    }

    const finalData: PaymentMethod = {
      id: docId,
      type: data.type || "bank",
      name: data.name || "",
      accountNumber: data.type === 'bank' ? (data.accountNumber || "") : "",
      accountHolder: data.type === 'bank' ? (data.accountHolder || "") : "",
      qrisImageUrl: data.type === 'qris' ? qrisUrl : "",
      isActive: true,
    };

    await setDoc(doc(db, COLLECTION, docId), finalData);
    return docId;
  } catch (error) {
    console.error("Error saving payment method:", error);
    throw error;
  }
}

/**
 * ADMIN: HAPUS METODE
 */
export async function deletePaymentMethod(id: string, qrisUrl?: string) {
  try {
    // Hapus dokumen
    await deleteDoc(doc(db, COLLECTION, id));

    // Jika ada gambar QRIS, hapus juga dari storage
    if (qrisUrl) {
       try {
         const fileRef = ref(storage, qrisUrl);
         await deleteObject(fileRef);
       } catch (e) {
         console.warn("Gambar QRIS mungkin sudah terhapus atau tidak ditemukan.");
       }
    }
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
}