import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Expense } from "@/lib/types/firestore";

const COLLECTION = "expenses";

/**
 * AMBIL SEMUA PENGELUARAN
 */
export async function getExpenses(): Promise<Expense[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Expense));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

/**
 * CATAT PENGELUARAN BARU
 */
export async function createExpense(data: Omit<Expense, "id" | "createdAt">) {
  try {
    await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
}

/**
 * HAPUS PENGELUARAN
 */
export async function deleteExpense(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
}