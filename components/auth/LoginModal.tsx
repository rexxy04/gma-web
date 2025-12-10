"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUI } from "@/lib/context/UIContext";
import { useAuth } from "@/lib/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUI();
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- LOGIC WHATSAPP ---
  const waNumber = "628884344774";
  const waMessage = "Halo Pengurus, saya warga Griya Mulya Asri ingin meminta akses akun website.";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await login(email, password);
      
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
           const role = docSnap.data().role;
           
           closeLoginModal();
           setEmail("");
           setPassword("");

           if (role === 'admin') {
             router.push("/dashboard");
           } else {
             router.refresh(); 
           }
        }
      }

    } catch (err: any) {
      // console.error("Login Error:", err.code); // <--- Baris ini dihapus/dikomentar agar bersih
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg("Email atau password salah.");
      } else {
        setErrorMsg("Terjadi kesalahan sistem. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isLoginModalOpen} 
      onClose={closeLoginModal} 
      title="Login Akun"
    >
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
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
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg(""); // <--- Hilangkan error saat user mengetik ulang
          }}
          icon={<Mail size={18} />}
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMsg) setErrorMsg(""); // <--- Hilangkan error saat user mengetik ulang
          }}
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

        <p className="text-center text-sm text-slate-500 mt-4">
          Belum punya akun?{" "}
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Hubungi pengurus RT.
          </a>
        </p>
      </form>
    </Modal>
  );
}