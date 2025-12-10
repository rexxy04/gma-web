import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";
import { GalleryItem } from "@/lib/types/firestore";

const COLLECTION = "gallery";

/**
 * PUBLIC: AMBIL SEMUA FOTO GALERI
 * Diurutkan dari yang terbaru diupload
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryItem));
  } catch (error) {
    console.error("Error get gallery items:", error);
    return [];
  }
}

/**
 * ADMIN: UPLOAD FOTO BARU
 */
export async function uploadGalleryItem(file: File) {
  try {
    // 1. Buat ID Dokumen baru
    const docRef = doc(collection(db, COLLECTION));
    const docId = docRef.id;

    // 2. Tentukan Path Storage (folder gallery)
    const storagePath = `gallery/${docId}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    // 3. Upload File ke Storage
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    // 4. Simpan Data ke Firestore
    const data: GalleryItem = {
      id: docId,
      url: downloadUrl,
      storagePath: storagePath, // Simpan path ini agar bisa dihapus nanti
      createdAt: Date.now(),
    };

    await setDoc(docRef, data);
    return docId;
  } catch (error) {
    console.error("Error upload gallery item:", error);
    throw error;
  }
}

/**
 * ADMIN: HAPUS FOTO
 * Menghapus data di Firestore DAN file aslinya di Storage
 */
export async function deleteGalleryItem(id: string, storagePath: string) {
  try {
    // 1. Hapus File di Storage dulu
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    // 2. Hapus Dokumen di Firestore
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error("Error delete gallery item:", error);
    // Note: Bisa jadi error kalau file di storage sudah hilang tapi di firestore masih ada.
    // Untuk MVP kita anggap aman, atau bisa tambahkan try-catch terpisah untuk storage delete.
    throw error;
  }
}