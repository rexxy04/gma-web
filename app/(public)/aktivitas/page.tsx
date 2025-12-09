import ActivityCard from "@/components/home/ActivityCard";
import { getPublishedActivities } from "@/lib/services/activity-service";

export default async function ActivitiesPage() {
  // Fetch SEMUA kegiatan yang published (tanpa limit)
  const allActivities = await getPublishedActivities();

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Arsip Kegiatan Warga
          </h1>
          <p className="text-slate-500 text-lg">
            Kumpulan berita dan dokumentasi kegiatan yang telah terlaksana di lingkungan <span className="text-blue-600 font-semibold">Griya Mulya Asri</span>.
          </p>
        </div>

        {allActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allActivities.map((item) => (
              <ActivityCard 
                key={item.id} 
                activity={item} 
                className="" 
                isHorizontal={false} 
              />
            ))}
          </div>
        ) : (
           <div className="text-center py-20">
             <p className="text-slate-400 text-lg">Belum ada arsip kegiatan.</p>
           </div>
        )}

      </div>
    </main>
  );
}