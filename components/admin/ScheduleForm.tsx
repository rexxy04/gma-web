"use client";

import { useState, useEffect } from "react";
import { Save, CalendarClock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { EventSchedule } from "@/lib/types/firestore";
import { saveSchedule } from "@/lib/services/schedule-service";

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: EventSchedule | null;
}

export default function ScheduleForm({ isOpen, onClose, onSuccess, initialData }: ScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState<Partial<EventSchedule>>({
    title: "",
    description: "",
    date: Date.now(),
    startTime: "08:00",
    endTime: "",
    location: "",
    category: "sosial",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form
      setFormData({
        title: "",
        description: "",
        date: Date.now(),
        startTime: "09:00",
        endTime: "",
        location: "",
        category: "sosial",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await saveSchedule(formData);
      alert("Jadwal berhasil disimpan!");
      onSuccess();
      onClose();
    } catch (error) {
      alert("Gagal menyimpan jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper date input value (YYYY-MM-DD)
  const dateValue = formData.date 
    ? new Date(formData.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Agenda" : "Tambah Agenda Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Input
          label="Nama Kegiatan"
          placeholder="Contoh: Posyandu Balita"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <div className="grid grid-cols-2 gap-4">
           <Input
              label="Tanggal"
              type="date"
              value={dateValue}
              onChange={(e) => setFormData({...formData, date: new Date(e.target.value).getTime()})}
              required
           />
           <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <select 
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              >
                  <option value="rapat">Rapat</option>
                  <option value="kerja-bakti">Kerja Bakti</option>
                  <option value="sosial">Sosial / Posyandu</option>
                  <option value="keamanan">Keamanan</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jam Mulai"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              required
            />
            <Input
              label="Jam Selesai (Opsional)"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            />
        </div>

        <Input
          label="Lokasi"
          placeholder="Contoh: Balai Warga RT 007"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required
        />

        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Catatan Tambahan</label>
            <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                rows={3}
                placeholder="Info tambahan untuk warga..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Save size={16} />}>
                Simpan
            </Button>
        </div>

      </form>
    </Modal>
  );
}