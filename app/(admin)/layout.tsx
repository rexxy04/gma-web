// src/app/(admin)/layout.tsx
import AdminLayoutShell from "@/components/layout/AdminLayoutShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Kita panggil Shell di sini
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  );
}