"use client";

import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import Button from "@/components/ui/Button";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void; // Jika diisi, akan muncul tombol Cancel & Confirm
  isLoading?: boolean; // Untuk tombol confirm loading state
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  isLoading = false,
}: AlertModalProps) {
  if (!isOpen) return null;

  // Konfigurasi Ikon & Warna berdasarkan Tipe
  const config = {
    success: {
      icon: <CheckCircle size={48} className="text-green-500" />,
      bgIcon: "bg-green-100",
      btnColor: "bg-green-600 hover:bg-green-700 text-white",
    },
    error: {
      icon: <XCircle size={48} className="text-red-500" />,
      bgIcon: "bg-red-100",
      btnColor: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <AlertTriangle size={48} className="text-orange-500" />,
      bgIcon: "bg-orange-100",
      btnColor: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    info: {
      icon: <Info size={48} className="text-blue-500" />,
      bgIcon: "bg-blue-100",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const currentConfig = config[type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icon Circle */}
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${currentConfig.bgIcon}`}>
          {currentConfig.icon}
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {title}
        </h3>
        
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {onConfirm ? (
            // MODE KONFIRMASI (Dua Tombol)
            <>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                disabled={isLoading}
                className="w-full"
              >
                Batal
              </Button>
              <Button 
                onClick={onConfirm} 
                isLoading={isLoading}
                className={`w-full ${currentConfig.btnColor}`}
              >
                Ya, Lanjutkan
              </Button>
            </>
          ) : (
            // MODE ALERT BIASA (Satu Tombol)
            <Button 
              onClick={onClose} 
              className={`w-full ${currentConfig.btnColor}`}
            >
              Oke, Mengerti
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}