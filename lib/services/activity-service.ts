import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";
import { Activity } from "@/lib/types/firestore";
import { limit, startAfter } from "firebase/firestore";

const COLLECTION = "activities";

/**
 * GENERATE SLUG (URL) DARI JUDUL
 * Contoh: "Kerja Bakti RT" -> "kerja-bakti-rt"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Hapus karakter aneh
    .replace(/[\s_-]+/g, "-") // Ganti spasi dengan strip
    .replace(/^-+|-+$/g, ""); // Hapus strip di awal/akhir
}

/**
 * READ: AMBIL SEMUA AKTIVITAS
 */
export async function getActivities(): Promise<Activity[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Activity));
  } catch (error) {
    console.error("Error get activities:", error);
    return [];
  }
}

/**
 * UPLOAD IMAGE HELPER
 */
async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * CREATE / UPDATE AKTIVITAS
 */
export async function saveActivity(
  data: Partial<Activity>, 
  mainImageFile: File | null, 
  galleryFiles: FileList | null,
  isEdit = false
) {
  try {
    const activityId = data.id || doc(collection(db, COLLECTION)).id;
    let mainImageUrl = data.mainImage || "";
    let galleryUrls = data.gallery || [];

    // 1. Upload Main Image (Jika ada file baru dipilih)
    if (mainImageFile) {
      mainImageUrl = await uploadImage(
        mainImageFile, 
        `activities/${activityId}/main_${Date.now()}_${mainImageFile.name}`
      );
    }

    // 2. Upload Gallery Images (Looping)
    if (galleryFiles && galleryFiles.length > 0) {
      const uploadPromises = Array.from(galleryFiles).map(file => 
        uploadImage(file, `activities/${activityId}/gallery_${Date.now()}_${file.name}`)
      );
      const newUrls = await Promise.all(uploadPromises);
      // Gabungkan dengan foto lama (jika edit)
      galleryUrls = [...galleryUrls, ...newUrls];
    }

    // 3. Simpan ke Firestore
    const finalData: Activity = {
      id: activityId,
      title: data.title!,
      slug: data.slug || generateSlug(data.title!),
      excerpt: data.excerpt!,
      content: data.content!,
      location: data.location || "",
      date: typeof data.date === 'string' ? new Date(data.date).getTime() : data.date!, // Konversi date input
      status: data.status || "published",
      isFeatured: data.isFeatured || false,
      mainImage: mainImageUrl,
      gallery: galleryUrls,
      createdAt: data.createdAt || Date.now(),
      author: data.author, // Diambil dari admin yang login
    };

    await setDoc(doc(db, COLLECTION, activityId), finalData);
    return activityId;

  } catch (error) {
    console.error("Error saving activity:", error);
    throw error;
  }
}

/**
 * DELETE AKTIVITAS
 */
export async function deleteActivity(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    // Note: Idealnya hapus juga gambar di Storage, 
    // tapi untuk MVP kita skip dulu biar simpel.
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}

/**
 * PUBLIC: AMBIL AKTIVITAS YANG PUBLISHED SAJA
 * Optional: limitCount untuk membatasi jumlah (misal untuk Homepage cuma butuh 3)
 */
export async function getPublishedActivities(limitCount?: number): Promise<Activity[]> {
  try {
    let q = query(
      collection(db, COLLECTION), 
      where("status", "==", "published"), // Hanya yang published
      orderBy("date", "desc") // Urutkan dari yang terbaru
    );

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Activity));
  } catch (error) {
    console.error("Error fetching published activities:", error);
    return [];
  }
}

/**
 * PUBLIC: AMBIL SATU AKTIVITAS BERDASARKAN SLUG
 */
export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  try {
    const q = query(
      collection(db, COLLECTION), 
      where("slug", "==", slug),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Activity;
  } catch (error) {
    console.error("Error fetching activity by slug:", error);
    return null;
  }
}git a