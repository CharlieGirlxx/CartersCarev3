import React, { useState } from "react";
import {
  Plus, Phone, MessageSquare, Clock, FileText, AlertCircle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color?: string;
}

interface QuickActionsProps {
  participantId?: number;
  onAddShift?: () => void;
  onQuickNote?: () => void;
  onCallEmergency?: () => void;
  onReportIncident?: () => void;
  onViewSchedule?: () => void;
}

export function QuickActions({
  participantId,
  onAddShift,
  onQuickNote,
  onCallEmergency,
  onReportIncident,
  onViewSchedule,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      id: "shift",
      label: "Add Shift",
      icon: <Clock className="h-5 w-5" />,
      action: () => {
        onAddShift?.();
        setIsOpen(false);
      },
    },
    {
      id: "note",
      label: "Quick Note",
      icon: <FileText className="h-5 w-5" />,
      action: () => {
        onQuickNote?.();
        setIsOpen(false);
      },
    },
    {
      id: "emergency",
      label: "Emergency",
      icon: <Phone className="h-5 w-5" />,
      action: () => {
        onCallEmergency?.();
        setIsOpen(false);
      },
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      id: "incident",
      label: "Report",
      icon: <AlertCircle className="h-5 w-5" />,
      action: () => {
        onReportIncident?.();
        setIsOpen(false);
      },
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: <Clock className="h-5 w-5" />,
      action: () => {
        onViewSchedule?.();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-30 md:hidden">
      {/* Quick Action Menu - Expanded */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
              Quick Actions
            </div>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={action.action}
              >
                <span className="text-slate-400">{action.icon}</span>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* FAB Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg ${
          isOpen
            ? "bg-slate-500 hover:bg-slate-600"
            : "bg-violet-600 hover:bg-violet-700"
        } text-white`}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}

/**
 * Mobile Quick Actions Helper - Shows available actions based on context
 */
export function useQuickActions(context: "dashboard" | "participant" | "roster") {
  const actions = {
    dashboard: ["Add Shift", "View Schedule", "Quick Note"],
    participant: ["Add Shift", "Quick Note", "Report Incident", "Emergency"],
    roster: ["Add Shift", "View Schedule"],
  };

  return {
    availableActions: actions[context] || [],
    isResponsive: true,
    touchFriendly: true, // Min 44px buttons
  };
}
