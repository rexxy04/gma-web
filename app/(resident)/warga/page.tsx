"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserPayments } from "@/lib/services/payment-service";
import { Payment } from "@/lib/types/firestore";
import { Wallet, Clock, CheckCircle, XCircle, Home, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function WargaDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoading(true);
        const data = await getUserPayments(user.uid);
        setPayments(data);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Helper Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={12} /> Lunas
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={12} /> Menunggu Verifikasi
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={12} /> Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* 1. HEADER PROFILE */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
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

      {/* 2. RIWAYAT PEMBAYARAN */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wallet className="text-blue-600" />
            Riwayat Pembayaran
        </h2>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
                <div className="p-8 text-center text-slate-500">Memuat data...</div>
            ) : payments.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Periode</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Tanggal Bayar</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Metode</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Nominal</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {p.month} / {p.year}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(p.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {p.paymentMethod === 'cash_manual' ? 'Tunai (Via Admin)' : 'Transfer Bank'}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        Rp {p.amount.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {getStatusBadge(p.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Wallet size={32} />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-1">Belum ada riwayat pembayaran</h3>
                    <p className="text-slate-500 text-sm mb-4">Anda belum melakukan pembayaran iuran bulan ini.</p>
                    <Link href="/#menu-cepat">
                        <Button variant="outline" size="sm">Bayar Sekarang</Button>
                    </Link>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}