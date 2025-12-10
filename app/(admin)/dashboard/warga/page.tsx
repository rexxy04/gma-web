"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Home, Phone, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import AddResidentModal from "@/components/admin/AddResidentModal";
import { getResidents, deleteResident } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types/firestore";

export default function WargaPage() {
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Modal & Dropdown
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<UserProfile | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // Menyimpan UID warga yang dropdown-nya aktif

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

  // Handle Edit
  const handleEdit = (warga: UserProfile) => {
    setEditingData(warga);
    setActiveDropdown(null); // Tutup dropdown
    setIsModalOpen(true);
  };

  // Handle Create
  const handleCreate = () => {
    setEditingData(null);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (uid: string) => {
    if (confirm("Yakin ingin menghapus data warga ini? (Akun login tidak terhapus otomatis)")) {
        setActiveDropdown(null);
        await deleteResident(uid);
        fetchData();
    }
  };

  const filteredResidents = residents.filter(r => 
    r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.houseBlock?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" onClick={() => setActiveDropdown(null)}> 
      {/* ^^^ Klik dimanapun menutup dropdown */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Warga</h1>
          <p className="text-slate-500">Kelola data penghuni dan akun akses website.</p>
        </div>
        <Button onClick={handleCreate} leftIcon={<UserPlus size={18} />}>
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible"> 
        {/* overflow-visible penting agar dropdown tidak terpotong */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Alamat</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kontak</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : filteredResidents.length > 0 ? (
                filteredResidents.map((warga) => (
                  <tr key={warga.uid} className="hover:bg-slate-50 transition-colors relative">
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
                    <td className="px-6 py-4 text-right relative">
                      {/* BUTTON TITIK TIGA */}
                      <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Mencegah klik tembus ke parent div
                            setActiveDropdown(activeDropdown === warga.uid ? null : warga.uid);
                        }}
                        className={`p-2 rounded-full transition-colors ${activeDropdown === warga.uid ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* DROPDOWN MENU */}
                      {activeDropdown === warga.uid && (
                        <div className="absolute right-8 top-8 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button 
                                onClick={() => handleEdit(warga)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                            >
                                <Edit size={14} /> Edit Data
                            </button>
                            <button 
                                onClick={() => handleDelete(warga.uid)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={14} /> Hapus
                            </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddResidentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        initialData={editingData} // Kirim data edit jika ada
      />
    </div>
  );
}