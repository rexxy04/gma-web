import Navbar from "@/components/layout/Navbar";
import ResidentGuard from "@/components/auth/ResidentGuard";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResidentGuard>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 pt-20 container mx-auto px-4 pb-12">
          {children}
        </main>
        {/* Footer bisa ditaruh disini juga jika mau */}
      </div>
    </ResidentGuard>
  );
}