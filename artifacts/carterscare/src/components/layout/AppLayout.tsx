import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, Calendar, UserSquare2, Clock, FileText, AlertTriangle, Pill, ShieldCheck, FileSignature, Target, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/participants", label: "Participants", icon: Users },
  { href: "/roster", label: "Roster", icon: Calendar },
  { href: "/staff", label: "Staff", icon: UserSquare2 },
  { href: "/timesheets", label: "Timesheets", icon: Clock },
  { href: "/case-notes", label: "Case Notes", icon: FileText },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/service-agreements", label: "Agreements", icon: FileSignature },
  { href: "/goals", label: "Goals", icon: Target },
];

function BrandMark() {
  return (
    <div className="relative h-10 w-10 rounded-2xl bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80">
      <div className="absolute inset-2 rounded-full bg-[conic-gradient(from_180deg,#f97316,#ef4444,#8b5cf6,#0ea5e9,#22c55e,#f59e0b,#f97316)] blur-[1px]" />
      <div className="absolute inset-[14px] rounded-full bg-white" />
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function NavContent() {
    return (
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.92))] backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Carter's</h2>
              <p className="-mt-1 text-xl font-semibold tracking-tight text-violet-600">Care</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all ${isActive ? "bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] text-slate-900" : "text-slate-500 hover:bg-white/70 hover:text-slate-900"}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="border-t border-white/70 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-slate-200/70">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="bg-violet-100 text-violet-700">{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500 capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
          <Button variant="outline" className="h-11 w-full justify-start rounded-full border-slate-200 bg-white/70 text-slate-600 shadow-sm hover:bg-white" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#eff6ff_35%,#f8fafc_72%)] text-slate-900">
      <div className="md:hidden flex items-center justify-between border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <BrandMark />
          <div>
            <div className="text-sm font-semibold">Carter's Care</div>
            <div className="text-[11px] text-slate-500">Management Platform</div>
          </div>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-white/70 bg-white/45 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl md:block">
          <NavContent />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
