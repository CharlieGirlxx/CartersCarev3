import { useGetShifts, getGetShiftsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { label: string; cls: string }> = {
  scheduled:   { label: "Scheduled",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  completed:   { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled:   { label: "Cancelled",   cls: "bg-slate-50 text-slate-500 border-slate-200" },
};

export default function Roster() {
  const { data: shifts, isLoading } = useGetShifts({
    query: { queryKey: getGetShiftsQueryKey() },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Roster</h1>
          <p className="mt-1 text-sm text-slate-500">Schedule and manage support shifts.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Create Shift
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !shifts?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <Calendar className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No shifts scheduled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => {
            const sc = statusConfig[shift.status] ?? { label: shift.status, cls: "bg-slate-50 text-slate-600" };
            return (
              <Card key={shift.id} className="rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 shrink-0">
                        <Calendar className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{shift.participantName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {shift.staffName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(shift.startTime), "MMM d, h:mm a")} – {format(parseISO(shift.endTime), "h:mm a")}
                          </span>
                          {shift.location ? (
                            <span className="flex items-center gap-1 hidden sm:flex">
                              <MapPin className="h-3 w-3" /> {shift.location}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <Badge variant="outline" className={`rounded-full text-xs capitalize ${sc.cls}`}>{sc.label}</Badge>
                      <Badge className="rounded-full text-[10px] px-2 py-0.5 border-0 bg-slate-100 text-slate-600 capitalize">
                        {shift.serviceType.replace(/_/g, " ")}
                      </Badge>
                      {shift.requiresTwoWorkers ? (
                        <Badge className="rounded-full text-[10px] px-2 py-0.5 border-0 bg-amber-50 text-amber-700">2-worker</Badge>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
