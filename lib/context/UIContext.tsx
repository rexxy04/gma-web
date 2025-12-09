// src/lib/context/UIContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Definisi tipe data untuk context kita
interface UIContextType {
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

// Nilai default (kosong)
const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider Component (pembungkus aplikasi nantinya)
export function UIProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <UIContext.Provider
      value={{ isLoginModalOpen, openLoginModal, closeLoginModal }}
    >
      {children}
    </UIContext.Provider>
  );
}

// Custom Hook agar mudah dipakai di komponen lain
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}