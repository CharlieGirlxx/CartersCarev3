import { useGetComplianceChecks, getGetComplianceChecksQueryKey, useGetExpiringCompliance, getGetExpiringComplianceQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, XCircle, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusConfig = {
  compliant:      { icon: CheckCircle2, cls: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  non_compliant:  { icon: XCircle,      cls: "text-rose-600",    badge: "bg-rose-50 text-rose-700 border-rose-200" },
  under_review:   { icon: Clock,        cls: "text-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  not_applicable: { icon: ShieldCheck,  cls: "text-slate-400",   badge: "bg-slate-50 text-slate-500 border-slate-200" },
};

export default function Compliance() {
  const { data: checks, isLoading: isLoadingChecks } = useGetComplianceChecks({
    query: { queryKey: getGetComplianceChecksQueryKey() },
  });
  const { data: expiring, isLoading: isLoadingExpiring } = useGetExpiringCompliance({
    query: { queryKey: getGetExpiringComplianceQueryKey() },
  });

  const nonCompliantCount = checks?.filter((c) => c.status === "non_compliant").length ?? 0;
  const compliantCount    = checks?.filter((c) => c.status === "compliant").length ?? 0;
  const total             = checks?.length ?? 0;
  const score             = total > 0 ? Math.round((compliantCount / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Compliance & Quality</h1>
          <p className="mt-1 text-sm text-slate-500">Track NDIS Practice Standards and Aged Care Quality Standards.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Check
        </Button>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Compliance Score", value: `${score}%`, cls: "text-violet-600" },
          { label: "Compliant",        value: compliantCount,    cls: "text-emerald-600" },
          { label: "Non-Compliant",    value: nonCompliantCount, cls: "text-rose-600" },
          { label: "Expiring Soon",    value: expiring?.length ?? 0, cls: "text-amber-600" },
        ].map(({ label, value, cls }) => (
          <Card key={label} className="rounded-2xl border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`text-2xl font-semibold ${cls}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Standards list */}
        <div className="lg:col-span-2 space-y-3">
          {isLoadingChecks ? (
            [1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)
          ) : (
            checks?.map((check) => {
              const cfg = statusConfig[check.status as keyof typeof statusConfig] ?? statusConfig.not_applicable;
              const Icon = cfg.icon;
              return (
                <Card key={check.id} className="rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.cls}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm">{check.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className="rounded-full text-[10px] px-2 py-0.5 border-0 bg-slate-100 text-slate-600">
                                {check.framework.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] text-slate-400 capitalize">{check.category.replace(/_/g, " ")}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="outline" className={`rounded-full text-xs capitalize ${cfg.badge}`}>
                              {check.status.replace(/_/g, " ")}
                            </Badge>
                            {check.dueDate ? (
                              <span className="text-[10px] text-slate-400">
                                Due {format(parseISO(check.dueDate), "MMM d, yyyy")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {check.evidence ? (
                          <p className="mt-2 text-xs text-slate-400 line-clamp-1">{check.evidence}</p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          {!isLoadingChecks && !checks?.length ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-12 text-center text-sm text-slate-500">
              No compliance checks recorded.
            </div>
          ) : null}
        </div>

        {/* Expiring items */}
        <div>
          <Card className={`rounded-2xl border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm ${nonCompliantCount > 0 ? "ring-2 ring-rose-200" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-rose-600">
                <AlertTriangle className="h-4 w-4" />
                Expiring / At Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoadingExpiring ? (
                [1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)
              ) : expiring?.length ? (
                expiring.map((item, i) => (
                  <div key={i} className="rounded-xl bg-rose-50 border border-rose-100 p-3">
                    <p className="text-sm font-medium text-slate-800">{item.itemName}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-slate-500">{item.entityName} <span className="text-slate-400">({item.entityType})</span></p>
                      <Badge className="rounded-full text-[10px] bg-rose-100 text-rose-700 border-0">
                        {format(parseISO(item.expiryDate), "MMM d")}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <p className="text-sm text-emerald-600 font-medium">All items current</p>
                  <p className="text-xs text-slate-400">No items expiring soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
