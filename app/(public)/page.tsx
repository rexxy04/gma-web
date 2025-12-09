// src/app/(public)/page.tsx
import Hero from "@/components/home/Hero";
import ActivityCard from "@/components/home/ActivityCard";
import { Activity } from "@/lib/types/firestore";
import QuickAccess from "@/components/home/QuickAccess";
import ScheduleSection from "@/components/home/ScheduleSection";
import DocumentationSection from "@/components/home/DocumentationSection";

// --- DUMMY DATA (Nanti ini diganti fetch dari Firebase) ---
const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Kerja Bakti Membersihkan Saluran Air Utama",
    slug: "kerja-bakti",
    excerpt: "Warga RT 007 bersama-sama membersihkan saluran air untuk mengantisipasi banjir di musim hujan. Terima kasih atas partisipasinya!",
    content: "",
    mainImage: "https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=1000&auto=format&fit=crop", // Placeholder image
    date: Date.now(),
    authorId: "admin1",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Rapat Koordinasi Keamanan Lingkungan",
    slug: "rapat-keamanan",
    excerpt: "Pembahasan jadwal ronda malam dan pemasangan CCTV baru di gerbang utama demi keamanan bersama.",
    content: "",
    mainImage: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1000&auto=format&fit=crop",
    date: Date.now() - 86400000,
    authorId: "admin1",
    isFeatured: false,
  },
  {
    id: "3",
    title: "Peringatan HUT RI ke-80",
    slug: "hut-ri-80",
    excerpt: "Persiapan lomba makan kerupuk dan panjat pinang untuk anak-anak kompleks.",
    content: "",
    mainImage: "https://images.unsplash.com/photo-1533230582998-38cbda50a22f?q=80&w=1000&auto=format&fit=crop",
    date: Date.now() - 172800000,
    authorId: "admin1",
    isFeatured: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* HERO SECTION */}
      <Hero />

      {/* SECTION AKTIVITAS TERBARU (Scroll Reveal style bisa ditambahkan nanti via Framer Motion wrapper) */}
      <section id="aktivitas" className="py-24 container mx-auto px-4 scroll-mt-20">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Aktivitas Terbaru
          </h2>
          <p className="text-slate-500 text-lg">
            Kegiatan dan momen berharga di lingkungan <span className="text-blue-600 font-semibold">Griya Mulya Asri</span>.
          </p>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DUMMY_ACTIVITIES.map((item, index) => (
            <ActivityCard 
              key={item.id} 
              activity={item} 
              // Contoh Bento logic: Item pertama lebar penuh di mobile/tablet, atau style beda
              className={index === 0 ? "lg:col-span-2" : ""} 
              isHorizontal={index === 0}
            />
          ))}
        </div>

      </section>

      {/* QUICK ACCESS SECTION */}
      <QuickAccess />

      {/* SCHEDULE SECTION */}
      <ScheduleSection />

      {/* DOCUMENTATION SECTION */}
      <DocumentationSection />
    </main>
  );
}