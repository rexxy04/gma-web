"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";
import { getPendingPayments, verifyPayment } from "@/lib/services/payment-service";
import { getResidents } from "@/lib/services/user-service";
import { useAuth } from "@/lib/context/AuthContext";
import { Payment, UserProfile } from "@/lib/types/firestore";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Image from "next/image";

export default function VerifikasiPage() {
  const { user: adminUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [residents, setResidents] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal Bukti Transfer
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // 1. Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, residentsData] = await Promise.all([
        getPendingPayments(),
        getResidents(),
      ]);

      setPayments(paymentsData);

      // Ubah array residents jadi object { "uid": UserProfile } biar gampang dicari
      const residentsMap: Record<string, UserProfile> = {};
      residentsData.forEach((r) => {
        residentsMap[r.uid] = r;
      });
      setResidents(residentsMap);

    } catch (error) {
      console.error("Gagal load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Aksi (Terima / Tolak)
  const handleVerify = async (paymentId: string, isApproved: boolean) => {
    if (!adminUser) return;
    const confirmMsg = isApproved 
      ? "Yakin ingin MENERIMA pembayaran ini?" 
      : "Yakin ingin MENOLAK pembayaran ini?";
    
    if (!confirm(confirmMsg)) return;

    try {
      await verifyPayment(paymentId, isApproved, adminUser.uid);
      // Refresh tabel setelah update
      fetchData();
      alert(isApproved ? "Pembayaran DITERIMA." : "Pembayaran DITOLAK.");
    } catch (error) {
      alert("Gagal memproses data.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Verifikasi Iuran</h1>
        <p className="text-slate-500">Cek bukti transfer yang dikirimkan warga.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Warga</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Periode</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Jumlah</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Bukti</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading data...</td></tr>
              ) : payments.length > 0 ? (
                payments.map((p) => {
                  const resident = residents[p.userId];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {resident ? resident.displayName : "Unknown User"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {resident ? `Blok ${resident.houseBlock}/${resident.houseNumber}` : p.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        Bulan {p.month} / {p.year}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-bold">
                        Rp {p.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        {p.proofUrl ? (
                          <button 
                            onClick={() => setSelectedProof(p.proofUrl!)}
                            className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                          >
                            <Eye size={14} /> Lihat Foto
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Tanpa bukti</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleVerify(p.id, false)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Tolak"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleVerify(p.id, true)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="Terima"
                        >
                          <CheckCircle size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-slate-100 p-3 rounded-full">
                        <CheckCircle size={24} className="text-green-500" />
                      </div>
                      <p>Tidak ada pembayaran yang perlu diverifikasi.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT BUKTI TRANSFER */}
      <Modal 
        isOpen={!!selectedProof} 
        onClose={() => setSelectedProof(null)} 
        title="Bukti Transfer"
      >
        <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden">
          {selectedProof && (
             // Gunakan unoptimized jika gambar dari URL eksternal belum di-config
             // atau ganti component Image dengan <img /> biasa untuk proof sementara
             <img 
               src={selectedProof} 
               alt="Bukti Transfer" 
               className="w-full h-full object-contain"
             />
          )}
        </div>
        <div className="mt-4 flex justify-end">
           <Button onClick={() => setSelectedProof(null)} variant="secondary">Tutup</Button>
        </div>
      </Modal>

    </div>
  );
}