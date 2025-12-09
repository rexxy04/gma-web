"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useUI } from "@/lib/context/UIContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUI();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi Login
    setTimeout(() => {
        console.log("Login:", { email, password });
        setIsLoading(false);
        closeLoginModal();
    }, 1500);
  };

  return (
    <Modal 
      isOpen={isLoginModalOpen} 
      onClose={closeLoginModal} 
      title="Login Pengurus"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email Field - Menggunakan Reusable Input */}
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

        {/* Password Field - Menggunakan Reusable Input + Toggle Logic */}
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
              tabIndex={-1} // Agar tidak terkena tab focus saat mengisi form
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {/* Action Button - Menggunakan Reusable Button */}
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