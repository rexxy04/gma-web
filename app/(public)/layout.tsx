import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar dipasang disini */}
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      {/* Footer Placeholder (Nanti kita update) */}
      <footer className="p-6 bg-slate-900 text-white text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Griya Mulya Asri. All rights reserved.</p>
      </footer>
    </div>
  );
}