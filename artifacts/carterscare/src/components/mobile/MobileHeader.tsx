import React from "react";
import { Bell, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MobileHeaderProps {
  userName?: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
  onNotifications?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function MobileHeader({
  userName = "User",
  avatarUrl,
  onMenuClick,
  notificationCount = 0,
  onNotifications,
  onSettings,
  onLogout,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 md:hidden">
      <div className="flex items-center justify-between px-4 py-3 h-14">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title/Logo - centered */}
        <div className="text-center flex-1">
          <h1 className="text-sm font-bold text-slate-900">Carter's Care</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          {notificationCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotifications}
              className="h-9 w-9 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                    {userName?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Staff Member</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
