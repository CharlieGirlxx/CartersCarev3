import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Calendar, UserSquare2, Clock,
  FileText, AlertTriangle, Pill, ShieldCheck, FileSignature,
  Target, LogOut, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard",          label: "Dashboard",        icon: LayoutDashboard },
  { href: "/participants",       label: "Participants",     icon: Users },
  { href: "/roster",             label: "Roster",           icon: Calendar },
  { href: "/staff",              label: "Staff",            icon: UserSquare2 },
  { href: "/timesheets",         label: "Timesheets",       icon: Clock },
  { href: "/case-notes",         label: "Case Notes",       icon: FileText },
  { href: "/incidents",          label: "Incidents",        icon: AlertTriangle },
  { href: "/medications",        label: "Medications",      icon: Pill },
  { href: "/compliance",         label: "Compliance",       icon: ShieldCheck },
  { href: "/service-agreements", label: "Agreements",       icon: FileSignature },
  { href: "/goals",              label: "Goals",            icon: Target },
];

function BrandMark({ size = 10 }: { size?: number }) {
  return (
    <div className={`relative h-${size} w-${size} rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80 shrink-0`}>
      <div className="absolute inset-[20%] rounded-full bg-[conic-gradient(from_180deg,#f97316,#ef4444,#8b5cf6,#0ea5e9,#22c55e,#f59e0b,#f97316)]" />
      <div className="absolute inset-[38%] rounded-full bg-white" />
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function NavContent() {
    return (
      <div className="flex h-full flex-col bg-white/80 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <BrandMark size={9} />
          <div className="leading-none">
            <div className="text-base font-bold tracking-tight text-slate-900">Carter's Care</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 mt-0.5">Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-violet-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }
                `}>
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="truncate text-xs text-slate-500 capitalize">{user?.role?.replace(/_/g, " ")}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full h-9 justify-start rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 text-sm"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(237,233,254,0.6),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(219,234,254,0.4),transparent_45%),#f8fafc]">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <BrandMark size={8} />
          <span className="text-sm font-bold text-slate-900">Carter's Care</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r border-slate-200/60">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Layout */}
      <div className="flex min-h-screen md:min-h-0">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-[1px_0_0_rgba(15,23,42,0.04)] md:block">
          <NavContent />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
