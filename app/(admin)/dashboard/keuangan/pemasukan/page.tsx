"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, Download } from "lucide-react";
import { getSuccessPayments, createManualPayment } from "@/lib/services/payment-service";
import { getResidents } from "@/lib/services/user-service";
import { useAuth } from "@/lib/context/AuthContext";
import { Payment, UserProfile } from "@/lib/types/firestore";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import AlertModal, { AlertType } from "@/components/ui/AlertModal"; // 1. Import AlertModal

export default function PemasukanPage() {
  const { user: adminUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [residents, setResidents] = useState<UserProfile[]>([]); 
  const [residentsMap, setResidentsMap] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal Manual Input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    amount: 100000, 
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // 2. State untuk Alert Custom
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [payData, resData] = await Promise.all([
        getSuccessPayments(),
        getResidents(),
      ]);
      setPayments(payData);
      setResidents(resData);
      
      const map: Record<string, UserProfile> = {};
      resData.forEach(r => map[r.uid] = r);
      setResidentsMap(map);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. Handle Input Manual dengan Alert
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser || !formData.userId) return;

    try {
      await createManualPayment({
        ...formData,
        adminId: adminUser.uid
      });
      
      // Alert Sukses
      setAlertState({
        isOpen: true,
        title: "Pembayaran Dicatat",
        message: "Data pembayaran tunai berhasil disimpan ke dalam sistem.",
        type: "success"
      });

      // Reset form default values
      setFormData(prev => ({
        ...prev,
        userId: "",
        amount: 100000
      }));

    } catch (error) {
      // Alert Gagal
      setAlertState({
        isOpen: true,
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat mencatat pembayaran.",
        type: "error"
      });
    }
  };

  // 4. Handle Tutup Alert
  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    
    // Jika sukses, tutup modal form dan refresh data
    if (alertState.type === "success") {
        setIsModalOpen(false);
        fetchData();
    }
  };

  // Hitung Total Pemasukan
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Pemasukan</h1>
          <p className="text-slate-500">Daftar iuran warga yang sudah lunas.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<Download size={18} />}>
                Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                Catat Tunai
            </Button>
        </div>
      </div>

      {/* STATISTIK KARTU KECIL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-600">Rp {totalAmount.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Transaksi</p>
            <p className="text-2xl font-bold text-slate-800">{payments.length} Data</p>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Warga</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Periode</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Metode</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : payments.length > 0 ? (
                payments.map((p) => {
                  const resident = residentsMap[p.userId];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">
                         {new Date(p.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {resident?.displayName || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        {p.month}/{p.year}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            p.paymentMethod === 'cash_manual' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                            {p.paymentMethod === 'cash_manual' ? 'Tunai (Admin)' : 'Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        Rp {p.amount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Belum ada data pemasukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT TUNAI */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Catat Pembayaran Tunai"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
             {/* Dropdown Warga */}
             <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Warga</label>
                <select 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    required
                >
                    <option value="">-- Pilih Warga --</option>
                    {residents.map(r => (
                        <option key={r.uid} value={r.uid}>
                            {r.displayName} (Blok {r.houseBlock}/{r.houseNumber})
                        </option>
                    ))}
                </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Bulan</label>
                    <select 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white"
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                    >
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <Input 
                    label="Tahun"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                />
             </div>

             <Input 
                label="Nominal (Rp)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
             />

             <div className="pt-4 flex justify-end gap-2">
                 <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                 <Button type="submit">Simpan</Button>
             </div>
        </form>
      </Modal>

      {/* 5. Render AlertModal */}
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

    </div>
  );
}