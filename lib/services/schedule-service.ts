import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { EventSchedule } from "@/lib/types/firestore";

const COLLECTION = "schedules";

/**
 * ADMIN: AMBIL SEMUA JADWAL (Termasuk yang sudah lewat)
 * Diurutkan dari yang terbaru dibuat (atau berdasarkan tanggal acara descending)
 */
export async function getAllSchedules(): Promise<EventSchedule[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventSchedule));
  } catch (error) {
    console.error("Error get schedules:", error);
    return [];
  }
}

/**
 * PUBLIC: AMBIL JADWAL YANG AKAN DATANG (UPCOMING)
 * Filter: Tanggal >= Hari ini
 * Sort: Ascending (Yang paling dekat muncul duluan)
 */
export async function getUpcomingSchedules(limitCount = 5): Promise<EventSchedule[]> {
  try {
    // Ambil timestamp hari ini (jam 00:00) agar agenda hari ini tetap muncul
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, COLLECTION),
      where("date", ">=", today.getTime()), // Hanya yang belum lewat
      orderBy("date", "asc"), // Urut dari yang terdekat
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventSchedule));
  } catch (error) {
    console.error("Error get upcoming schedules:", error);
    return [];
  }
}

/**
 * CREATE / UPDATE JADWAL
 */
export async function saveSchedule(data: Partial<EventSchedule>, isEdit = false) {
  try {
    const docId = data.id || doc(collection(db, COLLECTION)).id;
    
    const finalData: EventSchedule = {
      id: docId,
      title: data.title!,
      description: data.description || "",
      date: typeof data.date === 'string' ? new Date(data.date).getTime() : data.date!,
      startTime: data.startTime!,
      endTime: data.endTime || "",
      location: data.location!,
      category: data.category || "sosial",
    };

    await setDoc(doc(db, COLLECTION, docId), finalData);
    return docId;
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
}

/**
 * DELETE JADWAL
 */
export async function deleteSchedule(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
}