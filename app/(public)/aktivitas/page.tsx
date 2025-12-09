import ActivityCard from "@/components/home/ActivityCard";
import { Activity } from "@/lib/types/firestore";

// DUMMY DATA (Update struktur sesuai type baru)
// Nanti kita ganti dengan fetch Firestore
const ALL_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Kerja Bakti Membersihkan Saluran Air Utama",
    slug: "kerja-bakti-saluran-air",
    excerpt: "Warga RT 007 bersama-sama membersihkan saluran air untuk mengantisipasi banjir di musim hujan. Terima kasih atas partisipasinya!",
    content: "<p>Isi konten panjang...</p>",
    mainImage: "https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=1000&auto=format&fit=crop",
    date: Date.now(),
    location: "Saluran Utama Blok A",
    status: "published",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Rapat Koordinasi Keamanan Lingkungan",
    slug: "rapat-koordinasi-keamanan",
    excerpt: "Pembahasan jadwal ronda malam dan pemasangan CCTV baru di gerbang utama demi keamanan bersama.",
    content: "<p>Isi konten panjang...</p>",
    mainImage: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1000&auto=format&fit=crop",
    date: Date.now() - 86400000,
    location: "Pos Satpam",
    status: "published",
    isFeatured: false,
  },
  {
    id: "3",
    title: "Peringatan HUT RI ke-80",
    slug: "peringatan-hut-ri-80",
    excerpt: "Persiapan lomba makan kerupuk dan panjat pinang untuk anak-anak kompleks.",
    content: "<p>Isi konten panjang...</p>",
    mainImage: "https://images.unsplash.com/photo-1533230582998-38cbda50a22f?q=80&w=1000&auto=format&fit=crop",
    date: Date.now() - 172800000,
    location: "Lapangan Bulutangkis",
    status: "published",
    isFeatured: false,
  },
  // Tambah data dummy lagi untuk testing grid...
  {
    id: "4",
    title: "Senam Pagi Bersama Ibu-Ibu PKK",
    slug: "senam-pagi-pkk",
    excerpt: "Menjaga kesehatan jasmani dengan senam rutin setiap minggu pagi.",
    content: "",
    mainImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop",
    date: Date.now() - 300000000,
    location: "Halaman Balai Warga",
    status: "published",
    isFeatured: false,
  },
];

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* HEADER PAGE */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Arsip Kegiatan Warga
          </h1>
          <p className="text-slate-500 text-lg">
            Kumpulan berita dan dokumentasi kegiatan yang telah terlaksana di lingkungan <span className="text-blue-600 font-semibold">Griya Mulya Asri</span>.
          </p>
        </div>

        {/* LIST GRID */}
        {/* Disini kita tidak pakai layout bento yang aneh-aneh, cukup grid rapi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ALL_ACTIVITIES.map((item) => (
            <ActivityCard 
              key={item.id} 
              activity={item} 
              // Di halaman arsip, semua kartu ukurannya seragam (tidak ada featured yang besar)
              className="" 
              isHorizontal={false} 
            />
          ))}
        </div>

      </div>
    </main>
  );
}