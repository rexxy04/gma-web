"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import AddExpenseModal from "@/components/admin/AddExpenseModal";
import AlertModal, { AlertType } from "@/components/ui/AlertModal"; // 1. Import AlertModal
import { getExpenses, deleteExpense } from "@/lib/services/expense-service";
import { Expense } from "@/lib/types/firestore";

export default function PengeluaranPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. State Alert
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. Trigger Alert Konfirmasi Hapus
  const handleDeleteClick = (id: string) => {
    setAlertState({
        isOpen: true,
        title: "Hapus Pengeluaran?",
        message: "Data yang dihapus tidak dapat dikembalikan. Lanjutkan?",
        type: "warning", // Warna oranye
        onConfirm: () => processDelete(id),
    });
  };

  // 4. Proses Hapus Data
  const processDelete = async (id: string) => {
    setAlertState(prev => ({ ...prev, isLoading: true }));
    try {
        await deleteExpense(id);
        
        // Alert Sukses
        setAlertState({
            isOpen: true,
            title: "Data Dihapus",
            message: "Data pengeluaran berhasil dihapus dari sistem.",
            type: "success",
            onConfirm: undefined, // Hapus onConfirm agar jadi alert biasa
            isLoading: false
        });
        
        fetchData();
    } catch (error) {
        setAlertState({
            isOpen: true,
            title: "Gagal Menghapus",
            message: "Terjadi kesalahan saat menghapus data.",
            type: "error",
            onConfirm: undefined,
            isLoading: false
        });
    }
  };

  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catat Pengeluaran</h1>
          <p className="text-slate-500">Rekap biaya operasional dan belanja RT.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />} variant="danger">
          Catat Pengeluaran
        </Button>
      </div>

      {/* STATS CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600">Rp {totalExpense.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Keperluan</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kategori</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Nominal</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : expenses.length > 0 ? (
                expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                           <Calendar size={14} />
                           {new Date(item.date).toLocaleDateString("id-ID")}
                        </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                        {item.title}
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {item.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">
                        - Rp {item.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleDeleteClick(item.id)} // <--- Ganti logic delete
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Belum ada data pengeluaran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* 5. Render Alert */}
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