"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserPayments } from "@/lib/services/payment-service";
import { getUserComplaints } from "@/lib/services/complaint-service"; // Import service aduan
import { Payment, Complaint } from "@/lib/types/firestore"; // Import tipe data
import { Wallet, Clock, CheckCircle, XCircle, Home, User, MessageSquare, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function WargaDashboard() {
  const { user } = useAuth();
  
  // State Data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]); // State baru untuk aduan
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data (Pembayaran & Aduan)
  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoading(true);
        try {
          // Fetch Parallel agar cepat
          const [paymentsData, complaintsData] = await Promise.all([
            getUserPayments(user.uid),
            getUserComplaints(user.uid)
          ]);

          setPayments(paymentsData);
          setComplaints(complaintsData);
        } catch (error) {
          console.error("Gagal memuat data dashboard:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  // Helper Badge Status Pembayaran
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} /> Lunas</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock size={12} /> Menunggu</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Ditolak</span>;
      default: return null;
    }
  };

  // Helper Badge Status Aduan
  const getComplaintStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock size={12} /> Menunggu</span>;
      case "processing":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Clock size={12} /> Diproses</span>;
      case "done":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} /> Selesai</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Ditolak</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* 1. HEADER PROFILE */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <User size={40} />
        </div>
        <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Halo, {user?.displayName}</h1>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 text-slate-500 text-sm justify-center md:justify-start">
                <span className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Home size={16} /> Blok {user?.houseBlock?.toUpperCase()} / No. {user?.houseNumber}
                </span>
                <span className="hidden md:inline">•</span>
                <span>{user?.email}</span>
            </div>
        </div>
        <div>
            <Link href="/#menu-cepat">
                <Button>Bayar Iuran Baru</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 2. RIWAYAT PEMBAYARAN */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="text-blue-600" />
                Riwayat Pembayaran
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Memuat data...</div>
                ) : payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Periode</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Nominal</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-800">
                                            <span className="font-medium">{p.month}/{p.year}</span>
                                            <div className="text-xs text-slate-500">
                                                {new Date(p.createdAt).toLocaleDateString("id-ID")}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            Rp {p.amount.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {getPaymentStatusBadge(p.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-slate-500 text-sm mb-4">Belum ada riwayat pembayaran.</p>
                        <Link href="/#menu-cepat">
                            <Button variant="outline" size="sm">Bayar Sekarang</Button>
                        </Link>
                    </div>
                )}
            </div>
          </div>

          {/* 3. RIWAYAT LAPORAN / ADUAN (BARU) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="text-orange-500" />
                Laporan Saya
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Memuat data...</div>
                ) : complaints.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Judul</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Tanggal</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {complaints.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 group relative">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 line-clamp-1" title={c.title}>{c.title}</div>
                                            {/* Tampilkan respon admin jika ada */}
                                            {c.response && (
                                                <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-1 rounded inline-block">
                                                    💬 Admin: {c.response}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(c.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {getComplaintStatusBadge(c.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Anda belum pernah mengirim laporan.</p>
                        <Link href="/#menu-cepat">
                            <Button variant="outline" size="sm">Buat Laporan</Button>
                        </Link>
                    </div>
                )}
            </div>
          </div>

      </div>
    </div>
  );
}