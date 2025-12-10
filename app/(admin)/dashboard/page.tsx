"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Wallet, 
  MessageSquare, 
  AlertCircle, 
  ArrowRight, 
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import Button from "@/components/ui/Button";
import { getDashboardStats, DashboardStats } from "@/lib/services/dashboard-service";
import { getResidents } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types/firestore";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [residentsMap, setResidentsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      try {
        const data = await getDashboardStats();
        setStats(data);

        // Ambil nama warga untuk ditampilkan di tabel pending
        // (Optimasi: ambil hanya jika ada pending payments, tapi fetch all user juga oke untuk cache)
        const users = await getResidents();
        const map: Record<string, string> = {};
        users.forEach(u => map[u.uid] = u.displayName);
        setResidentsMap(map);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Menyiapkan ringkasan data...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ringkasan RT</h1>
        <p className="text-slate-500">Pantau kondisi keuangan dan pelayanan warga secara real-time.</p>
      </div>

      {/* 1. STATISTIK UTAMA (4 KARTU) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Kas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">Saldo Kas RT</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        Rp {stats.totalBalance.toLocaleString("id-ID")}
                    </h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Wallet size={20} />
                </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp size={12} /> Masuk: {(stats.totalIncome / 1000000).toFixed(1)}jt
                </span>
                <span className="text-red-600 flex items-center gap-1">
                    <TrendingDown size={12} /> Keluar: {(stats.totalExpense / 1000000).toFixed(1)}jt
                </span>
            </div>
        </div>

        {/* Iuran Pending */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">Menunggu Verifikasi</p>
                    <h3 className="text-2xl font-bold text-orange-600 mt-1">
                        {stats.pendingDues} <span className="text-sm font-normal text-slate-400">Transaksi</span>
                    </h3>
                </div>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <AlertCircle size={20} />
                </div>
            </div>
            <Link href="/dashboard/keuangan/verifikasi" className="text-xs text-blue-600 hover:underline">
                Proses sekarang &rarr;
            </Link>
        </div>

        {/* Aduan Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">Aduan Belum Selesai</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        {stats.pendingComplaints} <span className="text-sm font-normal text-slate-400">Laporan</span>
                    </h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <MessageSquare size={20} />
                </div>
            </div>
            <Link href="/dashboard/aduan" className="text-xs text-blue-600 hover:underline">
                Lihat daftar aduan &rarr;
            </Link>
        </div>

        {/* Total Warga */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">Total Warga Aktif</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        {stats.totalResidents} <span className="text-sm font-normal text-slate-400">KK</span>
                    </h3>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Users size={20} />
                </div>
            </div>
            <Link href="/dashboard/warga" className="text-xs text-blue-600 hover:underline">
                Kelola data warga &rarr;
            </Link>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID (Chart & Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI (Chart & Finance) - Span 2 */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* GRAFIK KEUANGAN */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Arus Kas Tahun Ini</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#64748b'}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#64748b'}}
                                tickFormatter={(value) => `Rp${value/1000}k`} 
                            />
                            <Tooltip 
                                formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                            <Legend wrapperStyle={{paddingTop: '20px'}} />
                            <Bar dataKey="pemasukan" name="Pemasukan" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TABEL BUTUH TINDAKAN (Iuran Pending) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Verifikasi Pembayaran Terbaru</h3>
                    <Link href="/dashboard/keuangan/verifikasi">
                        <Button variant="ghost" size="sm">Lihat Semua</Button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-slate-500 font-medium">Warga</th>
                                <th className="px-6 py-3 text-slate-500 font-medium">Nominal</th>
                                <th className="px-6 py-3 text-slate-500 font-medium">Tanggal</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recentPendingPayments.length > 0 ? (
                                stats.recentPendingPayments.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-slate-800">
                                            {residentsMap[p.userId] || "Unknown"}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            Rp {p.amount.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 text-xs">
                                            {new Date(p.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Link href="/dashboard/keuangan/verifikasi" className="text-blue-600 hover:underline text-xs font-medium">
                                                Cek
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Tidak ada pembayaran pending.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        {/* KOLOM KANAN (Agenda & Aduan) - Span 1 */}
        <div className="space-y-8">
            
            {/* AGENDA TERDEKAT */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="font-bold text-blue-100 mb-4 flex items-center gap-2">
                    <Calendar size={18} /> Agenda Berikutnya
                </h3>
                {stats.upcomingEvent ? (
                    <div>
                        <h2 className="text-xl font-bold mb-1">{stats.upcomingEvent.title}</h2>
                        <p className="text-blue-200 text-sm mb-4">
                            {new Date(stats.upcomingEvent.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })} 
                            {' • '} {stats.upcomingEvent.startTime}
                        </p>
                        <div className="flex items-center gap-2 text-xs bg-blue-700/50 p-2 rounded-lg backdrop-blur-sm w-fit">
                            <span className="uppercase font-bold tracking-wider">{stats.upcomingEvent.category}</span>
                            <span>@ {stats.upcomingEvent.location}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-blue-200">
                        <p>Belum ada jadwal kegiatan.</p>
                        <Link href="/dashboard/cms/jadwal">
                            <Button size="sm" className="mt-3 bg-white text-blue-600 hover:bg-blue-50 border-transparent">
                                Buat Agenda
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* ADUAN TERBARU */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Aduan Terbaru</h3>
                <div className="space-y-4">
                    {stats.recentComplaints.length > 0 ? (
                        stats.recentComplaints.map(c => (
                            <div key={c.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                                    c.status === 'pending' ? 'bg-red-500' : 
                                    c.status === 'processing' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />
                                <div>
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{c.title}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {new Date(c.createdAt).toLocaleDateString("id-ID")} • Oleh: {residentsMap[c.userId] || "Warga"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center text-sm">Belum ada aduan.</p>
                    )}
                </div>
                <Link href="/dashboard/aduan">
                    <Button variant="ghost" className="w-full mt-4 text-xs">Lihat Semua Aduan</Button>
                </Link>
            </div>

        </div>

      </div>
    </div>
  );
}