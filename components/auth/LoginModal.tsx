"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Untuk redirect
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUI } from "@/lib/context/UIContext";
import { useAuth } from "@/lib/context/AuthContext"; // Import Auth Hook
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUI();
  const { login } = useAuth(); // Ambil fungsi login
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // State untuk pesan error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Eksekusi Login Firebase
      await login(email, password);
      
      // 2. Jika sukses (tidak error):
      // Kita tunggu sebentar agar state AuthContext terupdate (optional, tapi aman)
      // Note: Redirect spesifik role sebaiknya dicek di AuthContext atau di sini setelah fetch user.
      // Untuk kesederhanaan, kita anggap jika login sukses, kita cek role nanti di halaman tujuan.
      
      // Tutup modal
      closeLoginModal();
      
      // Reset form
      setEmail("");
      setPassword("");

      // Redirect ke Dashboard (Nanti Middleware yang akan nendang balik jika bukan admin)
      // Tapi untuk UX yang baik, kita bisa redirect langsung:
      router.push("/dashboard");

    } catch (err: any) {
      // 3. Handle Error Firebase
      console.error("Login Error:", err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg("Email atau password salah.");
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg("Terlalu banyak percobaan. Coba lagi nanti.");
      } else {
        setErrorMsg("Terjadi kesalahan sistem. Hubungi admin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isLoginModalOpen} 
      onClose={closeLoginModal} 
      title="Login Pengurus"
    >
      {/* Pesan Error Alert */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="nama@contoh.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={18} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-slate-600 focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="pt-2">
            <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                isLoading={isLoading}
            >
                Masuk Sekarang
            </Button>
        </div>

        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Hubungi pengurus RT.
          </span>
        </p>
      </form>
    </Modal>
  );
}