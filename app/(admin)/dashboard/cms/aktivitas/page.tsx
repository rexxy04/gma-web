"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import ActivityForm from "@/components/admin/ActivityForm";
import { getActivities, deleteActivity } from "@/lib/services/activity-service";
import { Activity } from "@/lib/types/firestore";
import Link from "next/link";

export default function CMSAktivitasPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Activity | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Activity) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus kegiatan ini secara permanen?")) {
      await deleteActivity(id);
      fetchData(); // Refresh list
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Aktivitas</h1>
          <p className="text-slate-500">Buat berita dan dokumentasi kegiatan warga.</p>
        </div>
        <Button onClick={handleCreate} leftIcon={<Plus size={18} />}>
          Tambah Kegiatan
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Judul</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : activities.length > 0 ? (
                activities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 line-clamp-1">{item.title}</div>
                        <Link href={`/aktivitas/${item.slug}`} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                            Lihat di web <ExternalLink size={10} />
                        </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                        {new Date(item.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {item.status}
                        </span>
                        {item.isFeatured && (
                            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Featured
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        Belum ada kegiatan. Silakan tambah baru.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      <ActivityForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData} // Refresh table setelah save
        initialData={editingData}
      />
    </div>
  );
}