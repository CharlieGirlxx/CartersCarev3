import { useGetTimesheets, getGetTimesheetsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { cls: string; label: string }> = {
  approved:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
  submitted: { cls: "bg-blue-50 text-blue-700 border-blue-200",          label: "Submitted" },
  draft:     { cls: "bg-slate-50 text-slate-600 border-slate-200",       label: "Draft" },
  paid:      { cls: "bg-violet-50 text-violet-700 border-violet-200",    label: "Paid" },
  rejected:  { cls: "bg-rose-50 text-rose-700 border-rose-200",          label: "Rejected" },
};

export default function Timesheets() {
  const { data: timesheets, isLoading } = useGetTimesheets({
    query: { queryKey: getGetTimesheetsQueryKey() },
  });

  const pendingCount = timesheets?.filter((t) => t.status === "submitted").length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Timesheets</h1>
          <p className="mt-1 text-sm text-slate-500">Review and approve staff hours.</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="rounded-full bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1">
            {pendingCount} awaiting approval
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !timesheets?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <FileText className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No timesheets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timesheets.map((ts) => {
            const sc = statusConfig[ts.status] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", label: ts.status };
            return (
              <Card key={ts.id} className={`rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all ${ts.status === "submitted" ? "ring-2 ring-blue-200/60" : ""}`}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                    <Clock className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{ts.staffName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {format(parseISO(ts.weekStart), "MMM d")} – {format(parseISO(ts.weekEnd), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-semibold text-slate-900 tabular-nums">{ts.totalHours}<span className="text-xs font-normal text-slate-400 ml-1">hrs</span></p>
                      {(ts.overtimeHours ?? 0) > 0 ? (
                        <p className="text-[11px] text-amber-600">+{ts.overtimeHours} OT</p>
                      ) : null}
                    </div>
                    <Badge variant="outline" className={`rounded-full text-xs ${sc.cls}`}>{sc.label}</Badge>
                    {ts.status === "submitted" ? (
                      <Button size="sm" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="rounded-full text-xs text-violet-600 hover:bg-violet-50 h-8 px-3">View</Button>
                    )}
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
