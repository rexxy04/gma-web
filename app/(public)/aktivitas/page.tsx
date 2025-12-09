import Hero from "@/components/home/Hero";
import ActivityCard from "@/components/home/ActivityCard";
import QuickAccess from "@/components/home/QuickAccess";
import ScheduleSection from "@/components/home/ScheduleSection";
import DocumentationSection from "@/components/home/DocumentationSection";
import { getPublishedActivities } from "@/lib/services/activity-service"; // Import Fetcher

// Ubah menjadi async function agar bisa fetch data di server
export default async function Home() {
  // Fetch 3 kegiatan terbaru yang statusnya published
  const latestActivities = await getPublishedActivities(3);

  return (
    <main className="min-h-screen bg-slate-50">
      
      <Hero />

      {/* SECTION AKTIVITAS TERBARU */}
      <section id="aktivitas" className="py-24 container mx-auto px-4 scroll-mt-20">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Aktivitas Terbaru
          </h2>
          <p className="text-slate-500 text-lg">
            Kegiatan dan momen berharga di lingkungan <span className="text-blue-600 font-semibold">Griya Mulya Asri</span>.
          </p>
        </div>

        {/* BENTO GRID LAYOUT */}
        {latestActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestActivities.map((item, index) => (
              <ActivityCard 
                key={item.id} 
                activity={item} 
                // Item pertama jadi featured (lebar)
                className={index === 0 ? "lg:col-span-2" : ""} 
                isHorizontal={index === 0} 
              />
            ))}
          </div>
        ) : (
          // Fallback jika belum ada data sama sekali
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
            <p className="text-slate-500">Belum ada aktivitas terbaru yang diposting.</p>
          </div>
        )}

      </section>

      <QuickAccess />
      <ScheduleSection />
      <DocumentationSection />

    </main>
  );
}