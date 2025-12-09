// src/types/firestore.ts

// 1. USER & ROLES
export type UserRole = "guest" | "resident" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole; // 'guest' (0), 'resident' (1), 'admin' (2)
  phoneNumber?: string;
  houseBlock?: string; // Blok rumah (hanya untuk warga)
  houseNumber?: string; // Nomor rumah
  createdAt: number; // Timestamp
}

// 2. ACTIVITY / NEWS (Untuk Homepage)
export interface Activity {
    id: string;
    title: string;
    slug: string; // Untuk URL detail (misal: kerja-bakti-agustus)
    excerpt: string; // Deskripsi singkat untuk card
    content: string; // Isi lengkap (HTML/Markdown)
    mainImage: string; // URL gambar utama
    gallery?: string[]; // Array URL gambar dokumentasi tambahan
    date: number; // Timestamp kegiatan'
    location?: string; // Lokasi kegiatan
    author?: {
        uid: string;
        displayName: string;
    }; // Siapa pengurus yang posting
    status?: "draft" | "published"; // Status publikasi
    isFeatured: boolean; // Agar bisa ditag untuk tampil di atas
}

// 3. PAYMENT / IURAN (Persiapan fitur bayar)
export type PaymentStatus = "pending" | "success" | "failed";

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  month: number; // 1-12
  year: number;
  status: PaymentStatus;
  paymentMethod: string;
  proofUrl?: string; // Bukti transfer
  verifiedBy?: string; // ID Pengurus yang memverifikasi
  createdAt: number;
}

// 4. SCHEDULE / AGENDA KEGIATAN
export interface EventSchedule {
  id: string;
  title: string;
  description?: string;
  date: number; // Timestamp start
  startTime: string; // misal: "08:00 WIB"
  endTime?: string;  // misal: "12:00 WIB"
  location: string;
  category: "rapat" | "kerja-bakti" | "sosial" | "keamanan"; // Untuk color coding badge
}