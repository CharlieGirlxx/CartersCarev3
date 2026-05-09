import { useGetIncidents, getGetIncidentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

const severityConfig: Record<string, { cls: string; dot: string }> = {
  critical: { cls: "bg-red-600 text-white border-red-700",      dot: "bg-red-500" },
  high:     { cls: "bg-orange-100 text-orange-800 border-orange-200", dot: "bg-orange-500" },
  medium:   { cls: "bg-amber-50 text-amber-800 border-amber-200",  dot: "bg-amber-400" },
  low:      { cls: "bg-blue-50 text-blue-800 border-blue-200",    dot: "bg-blue-400" },
};

const statusCls: Record<string, string> = {
  submitted:          "bg-blue-50 text-blue-700 border-blue-200",
  under_investigation:"bg-amber-50 text-amber-700 border-amber-200",
  closed:             "bg-slate-50 text-slate-600 border-slate-200",
  resolved:           "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Incidents() {
  const { data: incidents, isLoading } = useGetIncidents({
    query: { queryKey: getGetIncidentsQueryKey() },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Incidents</h1>
          <p className="mt-1 text-sm text-slate-500">Manage, report and track incident investigations.</p>
        </div>
        <Button className="rounded-full bg-rose-600 text-white shadow-[0_8px_20px_rgba(225,29,72,0.25)] hover:bg-rose-700 w-fit">
          <AlertTriangle className="mr-2 h-4 w-4" /> Report Incident
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !incidents?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <AlertCircle className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No incidents recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const sc = severityConfig[incident.severity] ?? severityConfig.low;
            const stCls = statusCls[incident.status] ?? "bg-slate-50 text-slate-500 border-slate-200";
            return (
              <Card key={incident.id} className="rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${sc.dot}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{incident.participantName}</p>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{incident.type.replace(/_/g, " ")} · {format(parseISO(incident.incidentDate), "MMM d, yyyy")}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{incident.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {incident.reportableToNDIS && (
                            <Badge className="rounded-full text-[10px] px-2 py-0.5 border-0 bg-blue-100 text-blue-700">NDIS Reportable</Badge>
                          )}
                          {incident.reportableToAgedCare && (
                            <Badge className="rounded-full text-[10px] px-2 py-0.5 border-0 bg-purple-100 text-purple-700">Aged Care Reportable</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end shrink-0">
                      <Badge variant="outline" className={`rounded-full text-xs capitalize ${sc.cls}`}>{incident.severity}</Badge>
                      <Badge variant="outline" className={`rounded-full text-xs capitalize ${stCls}`}>{incident.status.replace(/_/g, " ")}</Badge>
                      <Button variant="ghost" size="sm" className="rounded-full text-xs text-violet-600 hover:bg-violet-50 h-7 px-3">View</Button>
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
