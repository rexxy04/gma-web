"use client";

import Image from "next/image";
import { Calendar, ArrowRight, User } from "lucide-react";
import Link from "next/link"; // Pastikan ini terimport
import { Activity } from "@/lib/types/firestore"; 
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface ActivityCardProps {
  activity: Activity;
  className?: string;
  isHorizontal?: boolean;
}

export default function ActivityCard({ 
  activity, 
  className,
  isHorizontal = false 
}: ActivityCardProps) {
  
  const formattedDate = new Date(activity.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex",
        isHorizontal ? "flex-col lg:flex-row" : "flex-col h-full",
        className
      )}
    >
      {/* 1. IMAGE SECTION */}
      <div className={cn(
        "relative overflow-hidden",
        isHorizontal ? "w-full h-56 lg:w-[45%] lg:h-auto" : "h-56 w-full"
      )}>
        <Image
          src={activity.mainImage}
          alt={activity.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 lg:opacity-30" />
        
        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-sm z-10">
          <Calendar size={12} className="text-blue-600" />
          {formattedDate}
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className={cn(
        "flex flex-col flex-1",
        isHorizontal ? "p-6 lg:p-8 lg:justify-center" : "p-5"
      )}>
        {/* Author / Category Kecil */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">
           <User size={12} />
           <span>Pengurus RT</span>
        </div>

        {/* --- UPDATE: Judul dibungkus Link --- */}
        <Link href={`/aktivitas/${activity.slug}`} className="block">
            <h3 className={cn(
              "font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors",
              isHorizontal ? "text-2xl md:text-3xl" : "text-lg line-clamp-2"
            )}>
              {activity.title}
            </h3>
        </Link>
        
        <p className={cn(
          "text-slate-500 mb-6",
          isHorizontal ? "text-base line-clamp-4" : "text-sm line-clamp-3 flex-1"
        )}>
          {activity.excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center w-full">
          {/* --- UPDATE: Tombol dibungkus Link --- */}
          <Link href={`/aktivitas/${activity.slug}`} className="ml-auto">
             <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-semibold text-xs flex items-center gap-1"
             >
                Baca Selengkapnya <ArrowRight size={14} />
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}