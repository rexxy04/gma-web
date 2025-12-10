"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import ScheduleForm from "@/components/admin/ScheduleForm";
import { getAllSchedules, deleteSchedule } from "@/lib/services/schedule-service";
import { EventSchedule } from "@/lib/types/firestore";

export default function CMSJadwalPage() {
  const [schedules, setSchedules] = useState<EventSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<EventSchedule | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSchedules();
      setSchedules(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Hapus agenda ini?")) {
      await deleteSchedule(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Jadwal</h1>
          <p className="text-slate-500">Atur agenda kegiatan RT (Rapat, Kerja Bakti, dll).</p>
        </div>
        <Button onClick={() => { setEditingData(null); setIsModalOpen(true); }} leftIcon={<Plus size={18} />}>
          Tambah Agenda
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Kegiatan</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Waktu</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Lokasi</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kategori</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : schedules.length > 0 ? (
                schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                        {item.title}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                           <Calendar size={14} />
                           {new Date(item.date).toLocaleDateString("id-ID")}
                        </div>
                        <div className="text-xs mt-1">
                            {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.location}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 uppercase">
                            {item.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button 
                            onClick={() => { setEditingData(item); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Belum ada agenda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScheduleForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        initialData={editingData}
      />
    </div>
  );
}