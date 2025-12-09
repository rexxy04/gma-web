"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Home, Phone, MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import AddResidentModal from "@/components/admin/AddResidentModal";
import { getResidents } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types/firestore";

export default function WargaPage() {
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getResidents();
      setResidents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Search Sederhana (Client Side)
  const filteredResidents = residents.filter(r => 
    r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.houseBlock?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Warga</h1>
          <p className="text-slate-500">Kelola data penghuni dan akun akses website.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<UserPlus size={18} />}>
          Tambah Warga
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Cari nama warga atau blok rumah..."
          className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Alamat (Blok/No)</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kontak</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status Akun</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Skeleton Loading Row
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : filteredResidents.length > 0 ? (
                filteredResidents.map((warga) => (
                  <tr key={warga.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{warga.displayName}</div>
                      <div className="text-xs text-slate-400">{warga.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Home size={16} className="text-slate-400" />
                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {warga.houseBlock?.toUpperCase()} / {warga.houseNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={16} className="text-slate-400" />
                        {warga.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-slate-100 p-3 rounded-full">
                            <UserPlus size={24} className="text-slate-400" />
                        </div>
                        <p>Belum ada data warga.</p>
                        <p className="text-xs">Klik tombol "Tambah Warga" di atas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AddResidentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData} // Refresh tabel setelah tambah sukses
      />
    </div>
  );
}