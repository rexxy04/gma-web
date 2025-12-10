"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Eye, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { getAllComplaints, updateComplaintStatus } from "@/lib/services/complaint-service";
import { getResidents } from "@/lib/services/user-service";
import { Complaint, UserProfile, ComplaintStatus } from "@/lib/types/firestore";

export default function AduanPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [residentsMap, setResidentsMap] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal Foto
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // 1. Fetch Data Aduan & Data Warga (untuk mapping nama)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [complaintsData, residentsData] = await Promise.all([
        getAllComplaints(),
        getResidents(),
      ]);

      setComplaints(complaintsData);

      // Buat map user id -> profile agar mudah dicari namanya
      const map: Record<string, UserProfile> = {};
      residentsData.forEach(r => map[r.uid] = r);
      setResidentsMap(map);

    } catch (error) {
      console.error("Gagal load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Ganti Status
  const handleStatusChange = async (id: string, newStatus: string) => {
    const status = newStatus as ComplaintStatus;
    // Optimistic Update (Ubah UI dulu biar cepat)
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));

    try {
      await updateComplaintStatus(id, status);
      // alert("Status diperbarui"); 
    } catch (error) {
      alert("Gagal update status.");
      fetchData(); // Rollback jika gagal
    }
  };

  // Helper Warna Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "done": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Aduan Masuk</h1>
        <p className="text-slate-500">Kelola laporan dan keluhan dari warga.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Pelapor</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Masalah</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Bukti</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status Penanganan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : complaints.length > 0 ? (
                complaints.map((item) => {
                  const resident = residentsMap[item.userId];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        <div className="text-xs">
                            {new Date(item.createdAt).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                           {resident ? resident.displayName : "Unknown User"}
                        </div>
                        <div className="text-xs text-slate-500">
                           {resident ? `Blok ${resident.houseBlock}/${resident.houseNumber}` : item.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-medium text-slate-800 mb-1">{item.title}</div>
                        <p className="text-slate-500 text-xs line-clamp-2" title={item.description}>
                            {item.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {item.imageUrl ? (
                           <button 
                             onClick={() => setSelectedPhoto(item.imageUrl!)}
                             className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs transition-colors"
                           >
                             <Eye size={14} /> Lihat
                           </button>
                        ) : (
                           <span className="text-slate-400 text-xs italic">Tidak ada foto</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                           value={item.status}
                           onChange={(e) => handleStatusChange(item.id, e.target.value)}
                           className={`rounded-lg text-xs font-semibold px-2 py-1.5 border outline-none cursor-pointer transition-colors ${getStatusColor(item.status)}`}
                        >
                            <option value="pending">⏳ Menunggu</option>
                            <option value="processing">🛠️ Sedang Diproses</option>
                            <option value="done">✅ Selesai</option>
                            <option value="rejected">❌ Ditolak</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                           <div className="bg-slate-100 p-3 rounded-full">
                              <MessageSquare size={24} className="text-slate-400" />
                           </div>
                           <p>Belum ada laporan masuk.</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT FOTO */}
      <Modal 
        isOpen={!!selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
        title="Lampiran Foto Laporan"
      >
        <div className="relative w-full h-[60vh] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
          {selectedPhoto && (
             // Menggunakan img biasa untuk preview modal agar simpel
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={selectedPhoto} 
               alt="Bukti Laporan" 
               className="max-w-full max-h-full object-contain"
             />
          )}
        </div>
        <div className="mt-4 flex justify-end">
           <Button onClick={() => setSelectedPhoto(null)} variant="secondary">Tutup</Button>
        </div>
      </Modal>

    </div>
  );
}