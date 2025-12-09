import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, User, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import ActivityGallery from "@/components/ui/ActivityGallery"; 
import { getActivityBySlug } from "@/lib/services/activity-service"; // Import Fetcher Asli


// HAPUS function dummy getActivityBySlug yang lama

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // FETCH DATA REAL
  const activity = await getActivityBySlug(slug);

  // Jika data tidak ditemukan di Firebase, tampilkan 404 Page
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
      
      {/* 1. HERO HEADER */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-slate-900">
        <Image
          src={activity.mainImage}
          alt={activity.title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        {/* Back Button */}
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
        
        {/* 2. MAIN CONTENT */}
        <div className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
                {/* Render HTML dari CMS */}
                <div dangerouslySetInnerHTML={{ __html: activity.content }} />
            </article>

            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500 text-sm">
                <span>Terakhir diupdate: {new Date(activity.createdAt || activity.date).toLocaleDateString("id-ID")}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Bagikan</Button>
                </div>
            </div>
        </div>

        {/* 3. SIDEBAR / GALLERY */}
        <aside className="lg:col-span-4 space-y-8">
            {activity.gallery && activity.gallery.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Galeri Dokumentasi
                    </h3>
                    <ActivityGallery images={activity.gallery} />
                </div>
            )}

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