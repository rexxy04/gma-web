import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";
import { Complaint, ComplaintStatus } from "@/lib/types/firestore";

const COLLECTION = "complaints";

/**
 * WARGA: KIRIM LAPORAN BARU
 */
export async function createComplaint(
  userId: string,
  data: { title: string; description: string },
  imageFile: File | null
) {
  try {
    let imageUrl = "";

    // 1. Upload Foto jika ada
    if (imageFile) {
      const storagePath = `complaints/${userId}/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // 2. Simpan ke Firestore
    const newComplaint: Omit<Complaint, "id"> = {
      userId,
      title: data.title,
      description: data.description,
      imageUrl: imageUrl || undefined,
      status: "pending", // Default status
      createdAt: Date.now(),
    };

    await addDoc(collection(db, COLLECTION), newComplaint);

  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
}

/**
 * WARGA: AMBIL RIWAYAT LAPORAN SENDIRI
 */
export async function getUserComplaints(userId: string): Promise<Complaint[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    return [];
  }
}

/**
 * ADMIN: AMBIL SEMUA LAPORAN (Bisa filter status)
 */
export async function getAllComplaints(statusFilter?: ComplaintStatus): Promise<Complaint[]> {
  try {
    let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    
    if (statusFilter) {
      // Note: Jika pakai filter + sort, mungkin butuh index baru di Firebase Console
      q = query(collection(db, COLLECTION), where("status", "==", statusFilter), orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    return [];
  }
}

/**
 * ADMIN: UPDATE STATUS & RESPON LAPORAN
 */
export async function updateComplaintStatus(
  id: string, 
  status: ComplaintStatus, 
  responseMessage?: string
) {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      status,
      response: responseMessage || "",
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    throw error;
  }
}