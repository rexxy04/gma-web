"use client";

import { MapPin, Clock, CalendarCheck } from "lucide-react";
import { EventSchedule } from "@/lib/types/firestore";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

// DUMMY DATA (Sementara)
const UPCOMING_EVENTS: EventSchedule[] = [
  {
    id: "1",
    title: "Posyandu Balita & Lansia",
    description: "Pemeriksaan kesehatan rutin bulanan dan pemberian vitamin.",
    date: Date.now() + 86400000 * 2, // 2 hari lagi
    startTime: "08:00",
    endTime: "11:00",
    location: "Balai Warga RT 007",
    category: "sosial",
  },
  {
    id: "2",
    title: "Kerja Bakti Lingkungan",
    description: "Fokus pembersihan selokan utama menjelang musim hujan.",
    date: Date.now() + 86400000 * 5, // 5 hari lagi
    startTime: "07:00",
    endTime: "Selesai",
    location: "Lingkungan RT 007",
    category: "kerja-bakti",
  },
  {
    id: "3",
    title: "Rapat Pemilihan Ketua Panitia 17an",
    description: "Diharapkan kehadiran perwakilan setiap dasawisma.",
    date: Date.now() + 86400000 * 10, // 10 hari lagi
    startTime: "19:30",
    endTime: "21:00",
    location: "Rumah Pak RT (Blok A4/12)",
    category: "rapat",
  },
];

export default function ScheduleSection() {
  return (
    <section id="jadwal" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* HEADER SECTION (Sticky di Desktop) */}
          <div className="w-full md:w-1/3 md:sticky md:top-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Agenda Kegiatan
            </h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Jangan lewatkan momen penting di lingkungan kita. Catat tanggalnya dan mari berpartisipasi!
            </p>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hidden md:block">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <CalendarCheck className="text-blue-600" size={20} />
                Info Tambahan
              </h4>
              <p className="text-sm text-slate-500">
                Jadwal dapat berubah sewaktu-waktu tergantung kondisi cuaca dan kesepakatan warga. Pantau terus grup WhatsApp untuk info mendadak.
              </p>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="w-full md:w-2/3 space-y-4">
            {UPCOMING_EVENTS.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            
            <div className="pt-4 text-center md:text-left">
                <Button variant="ghost">
                    Lihat Agenda Bulan Depan &rarr;
                </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Sub-Component untuk Card agar file tidak berantakan
function EventCard({ event }: { event: EventSchedule }) {
  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("id-ID", { month: "short" });
  const weekday = dateObj.toLocaleDateString("id-ID", { weekday: "long" });

  // Color Coding berdasarkan kategori
  const categoryColors = {
    rapat: "bg-purple-100 text-purple-700",
    "kerja-bakti": "bg-green-100 text-green-700",
    sosial: "bg-orange-100 text-orange-700",
    keamanan: "bg-red-100 text-red-700",
  };

  return (
    <div className="group bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      
      {/* 1. DATE BOX */}
      <div className="flex-shrink-0 w-full sm:w-20 bg-blue-50 rounded-xl p-3 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 text-center border border-blue-100">
        <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">{month}</span>
        <span className="text-3xl font-bold text-slate-800">{day}</span>
        <span className="text-xs text-slate-400 sm:mt-1 hidden sm:block">{weekday}</span>
      </div>

      {/* 2. DETAILS */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-3 mb-2">
            <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                categoryColors[event.category] || "bg-gray-100 text-gray-600"
            )}>
                {event.category.replace("-", " ")}
            </span>
            <span className="text-xs text-slate-400 font-medium sm:hidden block">
                {weekday}
            </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
            {event.title}
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-slate-400" />
                {event.startTime} {event.endTime ? `- ${event.endTime}` : ""}
            </div>
            <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-400" />
                {event.location}
            </div>
        </div>
      </div>

      {/* 3. ACTION (Desktop only mostly) */}
      <div className="flex-shrink-0 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
         <Button variant="outline" size="sm" className="rounded-xl">
            Detail
         </Button>
      </div>

    </div>
  );
}