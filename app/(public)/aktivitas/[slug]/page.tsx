import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, User, ArrowLeft, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { Activity } from "@/lib/types/firestore";

// --- KOMPONEN LIGHTBOX (Client Component Sederhana) ---
// Kita buat terpisah di file ini agar rapi, atau bisa dipisah ke components/ui
import ActivityGallery from "@/components/ui/ActivityGallery"; 

// --- DUMMY DATA SIMULASI FETCH ---
// Nanti diganti dengan: await getDoc(doc(db, "activities", slug))
async function getActivityBySlug(slug: string): Promise<Activity | null> {
  // Simulasi delay network
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulasi Data (Harusnya ambil dari Firestore berdasarkan field 'slug')
  // Kita return data dummy statis dulu agar UI tampil
  if (slug === "kerja-bakti-saluran-air") {
    return {
      id: "1",
      title: "Kerja Bakti Membersihkan Saluran Air Utama",
      slug: "kerja-bakti-saluran-air",
      excerpt: "Warga RT 007 bersama-sama...",
      // Simulasi HTML Content dari Rich Text Editor
      content: `
        <p class="mb-4">Warga RT 007 kembali menunjukkan kekompakannya. Pada hari Minggu pagi ini, puluhan warga berkumpul untuk melaksanakan kerja bakti membersihkan saluran air utama di sepanjang jalan blok A hingga blok C.</p>
        <p class="mb-4">Kegiatan ini diinisiasi mengingat musim hujan yang akan segera tiba. Saluran air yang tersumbat sampah plastik dan endapan lumpur dikhawatirkan dapat memicu genangan air atau banjir lokal seperti tahun sebelumnya.</p>
        <h3 class="text-xl font-bold mt-6 mb-2">Jalannya Kegiatan</h3>
        <p class="mb-4">Acara dimulai pukul 07.00 WITA dengan senam pemanasan ringan, dilanjutkan dengan pembagian tugas. Bapak-bapak fokus pada pengangkatan sedimen berat, sementara ibu-ibu dan remaja membantu menyapu jalanan dan menyiapkan konsumsi.</p>
        <p>Pak RT menyampaikan apresiasi setinggi-tingginya kepada seluruh warga yang telah meluangkan waktu liburnya demi kepentingan bersama.</p>
      `,
      mainImage: "https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=1000&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=600&auto=format&fit=crop",
      ],
      date: Date.now(),
      location: "Saluran Utama Blok A - C",
      status: "published",
      isFeatured: true,
      author: {
        uid: "admin1",
        displayName: "Sekretaris RT"
      }
    };
  }
  
  // Default data (agar halaman lain tidak error saat testing)
  return {
    id: "99",
    title: "Judul Kegiatan Demo (Placeholder)",
    slug: slug,
    excerpt: "Deskripsi singkat kegiatan...",
    content: "<p>Ini adalah konten dummy karena data asli belum ada di database.</p>",
    mainImage: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1000&auto=format&fit=crop",
    date: Date.now(),
    location: "Balai Warga",
    status: "published",
    isFeatured: false,
    author: { uid: "admin1", displayName: "Admin" }
  };
}

// --- MAIN PAGE COMPONENT ---
// Perhatikan: params di Next.js 15 adalah Promise
export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  const formattedDate = new Date(activity.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-white pb-20">
      
      {/* 1. HERO HEADER (Full Width Image) */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-slate-900">
        <Image
          src={activity.mainImage}
          alt={activity.title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        {/* Back Button (Absolute) */}
        <div className="absolute top-24 left-4 md:left-8 z-20">
            <Link href="/aktivitas">
                <Button variant="glass" size="sm" leftIcon={<ArrowLeft size={16}/>}>
                    Kembali
                </Button>
            </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
            <div className="container mx-auto">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold mb-3 uppercase tracking-wider">
                    {activity.isFeatured ? "Berita Utama" : "Kegiatan Warga"}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-md">
                    {activity.title}
                </h1>
                
                {/* Meta Info Row */}
                <div className="flex flex-wrap items-center gap-4 md:gap-8 text-slate-200 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-blue-400" />
                        {formattedDate}
                    </div>
                    {activity.location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-red-400" />
                            {activity.location}
                        </div>
                    )}
                    {activity.author && (
                         <div className="flex items-center gap-2">
                            <User size={18} className="text-green-400" />
                            Diposting oleh {activity.author.displayName}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2. MAIN CONTENT (Left Side) */}
        <div className="lg:col-span-8">
            {/* Render HTML Content */}
            <article className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                {/* Kita gunakan dangerouslySetInnerHTML untuk merender HTML dari CMS */}
                <div dangerouslySetInnerHTML={{ __html: activity.content }} />
            </article>

            {/* Tags / Footer Article */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500 text-sm">
                <span>Terakhir diupdate: {new Date(activity.date).toLocaleDateString("id-ID")}</span>
                <div className="flex gap-2">
                    {/* Share Button Placeholder */}
                    <Button variant="outline" size="sm">Bagikan</Button>
                </div>
            </div>
        </div>

        {/* 3. SIDEBAR / GALLERY (Right Side) */}
        <aside className="lg:col-span-4 space-y-8">
            
            {/* Gallery Widget */}
            {activity.gallery && activity.gallery.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Image className="w-5 h-5" width={20} height={20} src="/icons/gallery.svg" alt="" /> {/* Icon Placeholder */}
                        Galeri Dokumentasi
                    </h3>
                    
                    {/* Panggil Client Component untuk Lightbox */}
                    <ActivityGallery images={activity.gallery} />
                </div>
            )}

            {/* Other Info Widget (Misal Jadwal Terkait) */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Ingin berpartisipasi?</h3>
                <p className="text-sm text-blue-700 mb-4">
                    Pantau terus jadwal kegiatan warga terbaru di dashboard jadwal.
                </p>
                <Link href="/#jadwal">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Lihat Jadwal
                    </Button>
                </Link>
            </div>
        </aside>

      </div>
    </main>
  );
}