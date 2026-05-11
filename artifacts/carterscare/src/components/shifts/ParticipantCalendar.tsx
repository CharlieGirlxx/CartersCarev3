import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek } from "date-fns";

interface Shift {
  id: number;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  staffName: string;
  serviceType: string;
}

interface ParticipantCalendarProps {
  participantId: number;
  shifts?: Shift[];
  onAddShift?: () => void;
  onEditShift?: (shiftId: number) => void;
  view?: 'month' | 'week';
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-slate-50 text-slate-700 border-slate-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export function ParticipantCalendar({ participantId, shifts = [], onAddShift, view = 'month' }: ParticipantCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week'>(view);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  return (
    <Card className="border-muted shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <Button
              size="sm"
              variant={viewType === 'month' ? 'default' : 'ghost'}
              onClick={() => setViewType('month')}
              className="h-8 px-3 text-xs"
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={viewType === 'week' ? 'default' : 'ghost'}
              onClick={() => setViewType('week')}
              className="h-8 px-3 text-xs"
            >
              Week
            </Button>
          </div>
          <Button size="icon" variant="outline" onClick={goToPrevious} className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={goToNext} className="h-9 w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={onAddShift} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-semibold text-slate-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayShifts = getShiftsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-24 rounded-lg border p-1 text-xs ${
                    isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                  } ${isTodayDate ? 'ring-2 ring-violet-500' : ''}`}
                >
                  <div className={`font-semibold mb-1 ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </div>

                  {/* Shifts for this day */}
                  <div className="space-y-0.5">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className={`p-1 rounded cursor-pointer border hover:shadow-sm transition-shadow ${statusColors[shift.status]}`}
                        onClick={() => {}}
                      >
                        <div className="font-medium truncate">{format(new Date(shift.startTime), 'HH:mm')}</div>
                        <div className="truncate text-[10px] opacity-75">{shift.staffName}</div>
                      </div>
                    ))}
                  </div>

                  {/* Add shift button for this day */}
                  {isCurrentMonth && dayShifts.length === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onAddShift}
                      className="w-full h-6 mt-1 text-xs text-slate-400 hover:text-violet-600"
                    >
                      + Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className={`h-3 w-3 rounded ${colors.split(' ')[0]}`} />
              <span className="text-slate-600 capitalize">{status}</span>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {shifts.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
            <p className="text-sm text-slate-500 mb-3">No shifts scheduled for this period</p>
            <Button onClick={onAddShift} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add First Shift
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
