"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react"; // Hapus AlertCircle jk tidak dipakai
import { getPendingPayments, verifyPayment } from "@/lib/services/payment-service";
import { getResidents } from "@/lib/services/user-service";
import { useAuth } from "@/lib/context/AuthContext";
import { Payment, UserProfile } from "@/lib/types/firestore";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AlertModal, { AlertType } from "@/components/ui/AlertModal"; // 1. Import AlertModal

export default function VerifikasiPage() {
  const { user: adminUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [residents, setResidents] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal Bukti Transfer
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // 2. State Alert Modal
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void; // Jika ada isinya, muncul tombol konfirmasi
    isLoading?: boolean;    // Loading state tombol konfirmasi
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // 1. Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, residentsData] = await Promise.all([
        getPendingPayments(),
        getResidents(),
      ]);

      setPayments(paymentsData);

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

  // 3. Tahap 1: Munculkan Modal Konfirmasi saat tombol diklik
  const handleVerifyClick = (paymentId: string, isApproved: boolean) => {
    setAlertState({
        isOpen: true,
        title: isApproved ? "Terima Pembayaran?" : "Tolak Pembayaran?",
        message: isApproved 
            ? "Pastikan dana sudah masuk ke rekening kas RT. Tindakan ini tidak dapat dibatalkan."
            : "Warga akan diminta untuk mengupload ulang bukti pembayaran.",
        type: isApproved ? "info" : "warning",
        onConfirm: () => processVerification(paymentId, isApproved), // Pass fungsi proses
    });
  };

  // 4. Tahap 2: Proses Data ke Database
  const processVerification = async (paymentId: string, isApproved: boolean) => {
    if (!adminUser) return;
    
    // Set loading pada tombol alert
    setAlertState(prev => ({ ...prev, isLoading: true }));

    try {
      await verifyPayment(paymentId, isApproved, adminUser.uid);
      
      // Update Alert menjadi Sukses (Hapus onConfirm agar tombol Batal hilang)
      setAlertState({
        isOpen: true,
        title: isApproved ? "Pembayaran Diterima" : "Pembayaran Ditolak",
        message: "Status pembayaran berhasil diperbarui.",
        type: "success",
        onConfirm: undefined, // Penting: jadikan undefined
        isLoading: false
      });

      // Refresh tabel
      fetchData(); 
    } catch (error) {
      setAlertState({
        isOpen: true,
        title: "Gagal Memproses",
        message: "Terjadi kesalahan sistem saat memverifikasi data.",
        type: "error",
        onConfirm: undefined,
        isLoading: false
      });
    }
  };

  // Handler tutup alert
  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
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
                        {/* BUTTON TOLAK */}
                        <button 
                          onClick={() => handleVerifyClick(p.id, false)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Tolak"
                        >
                          <XCircle size={20} />
                        </button>
                        {/* BUTTON TERIMA */}
                        <button 
                          onClick={() => handleVerifyClick(p.id, true)}
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
        <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
          {selectedProof && (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={selectedProof} 
               alt="Bukti Transfer" 
               className="max-w-full max-h-full object-contain"
             />
          )}
        </div>
        <div className="mt-4 flex justify-end">
           <Button onClick={() => setSelectedProof(null)} variant="secondary">Tutup</Button>
        </div>
      </Modal>

      {/* ALERT MODAL (KONFIRMASI & HASIL) */}
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.onConfirm}
        isLoading={alertState.isLoading}
      />

    </div>
  );
}