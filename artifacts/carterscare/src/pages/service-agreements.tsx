import { useGetServiceAgreements, getGetServiceAgreementsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ServiceAgreements() {
  const { data: agreements, isLoading } = useGetServiceAgreements({
    query: { queryKey: getGetServiceAgreementsQueryKey() },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Service Agreements</h1>
          <p className="mt-1 text-sm text-slate-500">Manage funding contracts and budgets.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> New Agreement
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !agreements?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <FileSignature className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No service agreements found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agreements.map((ag) => {
            const total = ag.totalBudget ?? 0;
            const spent = ag.spentBudget ?? 0;
            const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
            const isOverBudget = pct > 90;
            return (
              <Card key={ag.id} className="rounded-2xl border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">{ag.participantName}</p>
                        <Badge className={`rounded-full text-xs px-2 py-0.5 border-0 ${ag.fundingType === "ndis" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {ag.fundingType.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`rounded-full text-xs capitalize ${ag.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600"}`}>
                          {ag.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(ag.startDate), "MMM d, yyyy")} — {format(parseISO(ag.endDate), "MMM d, yyyy")}
                      </p>
                      {ag.supportCategories ? (
                        <p className="text-xs text-slate-400 mt-1 truncate">{ag.supportCategories}</p>
                      ) : null}
                    </div>

                    <div className="sm:w-64 shrink-0 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>Budget utilisation</span>
                        <span className={isOverBudget ? "text-rose-600" : ""}>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? "bg-rose-500" : "bg-violet-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>${spent.toLocaleString()} spent</span>
                        <span className="text-slate-400">${total.toLocaleString()} total</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="rounded-full text-violet-600 hover:bg-violet-50 shrink-0">Review</Button>
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
