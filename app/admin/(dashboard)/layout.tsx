import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-mist">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-ink text-mist flex flex-col fixed inset-y-0 left-0">
        <div className="p-8">
          <h1 className="font-display text-2xl font-semibold mb-2">Bella Vista</h1>
          <p className="text-mist/50 text-[12px] uppercase tracking-wider">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 font-body text-sm">
          <Link 
            href="/admin/bookings" 
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            Bookings
          </Link>
          <Link 
            href="/admin/calendar" 
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            Calendar
          </Link>
          <Link 
            href="/admin/rooms" 
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            Rooms & Pricing
          </Link>
          <Link 
            href="/admin/revenue" 
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            Revenue
          </Link>
        </nav>

        <div className="p-8 mt-auto">
          <Link 
            href="/" 
            className="text-[12px] text-mist/60 hover:text-white transition-colors"
          >
            &larr; Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
