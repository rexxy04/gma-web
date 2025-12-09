// src/app/(admin)/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-4 hidden md:block">
        [Sidebar Admin]
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Konten Dashboard */}
        {children}
      </main>
    </div>
  );
}