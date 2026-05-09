import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserSquare2, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Pill, 
  ShieldCheck, 
  FileSignature, 
  Target,
  LogOut,
  Menu
} from "lucide-react";
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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 flex items-center gap-3">
        <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M50 50 L50 10 A20 20 0 0 1 70 30 Z" fill="hsl(var(--chart-1))" />
            <path d="M50 50 L90 50 A20 20 0 0 1 70 70 Z" fill="hsl(var(--chart-2))" />
            <path d="M50 50 L50 90 A20 20 0 0 1 30 70 Z" fill="hsl(var(--chart-3))" />
            <path d="M50 50 L10 50 A20 20 0 0 1 30 30 Z" fill="hsl(var(--chart-4))" />
          </svg>
          <div className="absolute w-2 h-2 bg-background rounded-full z-10" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight tracking-tight">Carter's Care</h2>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Management Platform</p>
        </div>
      </div>

      <div className="px-4 py-2 flex-1 overflow-y-auto no-scrollbar space-y-1">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50 50 L50 10 A20 20 0 0 1 70 30 Z" fill="hsl(var(--chart-1))" />
              <path d="M50 50 L90 50 A20 20 0 0 1 70 70 Z" fill="hsl(var(--chart-2))" />
              <path d="M50 50 L50 90 A20 20 0 0 1 30 70 Z" fill="hsl(var(--chart-3))" />
              <path d="M50 50 L10 50 A20 20 0 0 1 30 30 Z" fill="hsl(var(--chart-4))" />
            </svg>
          </div>
          <span className="font-bold">Carter's Care</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border bg-card/50 shrink-0 sticky top-0 h-screen overflow-hidden">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-0 bg-background">
        {children}
      </main>
    </div>
  );
}
