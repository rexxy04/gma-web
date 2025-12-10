import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Payment, Expense, Complaint, EventSchedule, UserProfile } from "@/lib/types/firestore";

// Tipe Data untuk Response Dashboard
export interface DashboardStats {
  totalBalance: number; // Saldo Akhir
  totalIncome: number;
  totalExpense: number;
  pendingDues: number;
  pendingComplaints: number;
  totalResidents: number;
  recentPendingPayments: Payment[]; // Untuk tabel "Butuh Tindakan"
  recentComplaints: Complaint[];    // Untuk list aduan terbaru
  upcomingEvent: EventSchedule | null; // Agenda terdekat
  chartData: { name: string; pemasukan: number; pengeluaran: number }[]; // Data Grafik
}

/**
 * AMBIL SEMUA DATA DASHBOARD (Heavy Query)
 * Note: Idealnya ini dilakukan di Server Side atau pakai Cloud Functions untuk performa.
 * Tapi untuk skala RT (data ribuan), client-side fetch masih aman dan cepat.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Fetch Parallel Semua Data Penting
    const [
      paymentsSnap, 
      expensesSnap, 
      complaintsSnap, 
      residentsSnap,
      schedulesSnap
    ] = await Promise.all([
      getDocs(query(collection(db, "payments"))), // Ambil semua pembayaran
      getDocs(query(collection(db, "expenses"))), // Ambil semua pengeluaran
      getDocs(query(collection(db, "complaints"), orderBy("createdAt", "desc"))), // Ambil semua aduan
      getDocs(query(collection(db, "users"), where("role", "==", "resident"))), // Ambil warga
      getDocs(query(collection(db, "schedules"), where("date", ">=", now.getTime()), orderBy("date", "asc"), limit(1))) // 1 Agenda terdekat
    ]);

    // 2. Olah Data Keuangan (Income, Expense, Balance) & Chart
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyStats: Record<number, { inc: number; exp: number }> = {};

    // Inisialisasi Chart 12 Bulan (0-11)
    for (let i = 0; i < 12; i++) monthlyStats[i] = { inc: 0, exp: 0 };

    // Proses Pembayaran (Hanya yang SUCCESS yang dihitung duitnya)
    const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
    payments.forEach(p => {
      if (p.status === 'success') {
        totalIncome += p.amount;
        // Masukkan ke Chart jika tahunnya sama
        if (p.year === currentYear) {
          // p.month biasanya 1-12, kita butuh index 0-11
          const monthIndex = p.month - 1;
          if (monthlyStats[monthIndex]) monthlyStats[monthIndex].inc += p.amount;
        }
      }
    });

    // Proses Pengeluaran
    const expenses = expensesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
    expenses.forEach(e => {
      totalExpense += e.amount;
      const date = new Date(e.date);
      if (date.getFullYear() === currentYear) {
        monthlyStats[date.getMonth()].exp += e.amount;
      }
    });

    // Format Data untuk Recharts
    const chartData = Object.keys(monthlyStats).map((key) => {
      const k = parseInt(key);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return {
        name: months[k],
        pemasukan: monthlyStats[k].inc,
        pengeluaran: monthlyStats[k].exp,
      };
    });

    // 3. Filter Data Lainnya
    const pendingDues = payments.filter(p => p.status === 'pending');
    
    // Ambil 5 Pembayaran Pending Terbaru untuk Widget
    // (Sort manual karena kita fetch all payments tadi)
    const recentPendingPayments = pendingDues
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    const complaints = complaintsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
    const pendingComplaintsCount = complaints.filter(c => c.status === 'pending' || c.status === 'processing').length;
    
    const upcomingEvent = schedulesSnap.empty 
      ? null 
      : { id: schedulesSnap.docs[0].id, ...schedulesSnap.docs[0].data() } as EventSchedule;

    return {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      pendingDues: pendingDues.length,
      pendingComplaints: pendingComplaintsCount,
      totalResidents: residentsSnap.size,
      recentPendingPayments,
      recentComplaints: complaints.slice(0, 5), // 5 Aduan terbaru
      upcomingEvent,
      chartData
    };

  } catch (error) {
    console.error("Gagal hitung dashboard stats:", error);
    throw error;
  }
}