import { useGetGoals, getGetGoalsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Plus, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

const categoryColor: Record<string, string> = {
  independence:             "bg-blue-50 text-blue-700 ring-blue-200",
  community_participation:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  health_wellbeing:         "bg-rose-50 text-rose-700 ring-rose-200",
  relationships:            "bg-pink-50 text-pink-700 ring-pink-200",
  employment_education:     "bg-amber-50 text-amber-700 ring-amber-200",
  communication:            "bg-cyan-50 text-cyan-700 ring-cyan-200",
  daily_living:             "bg-violet-50 text-violet-700 ring-violet-200",
  safety:                   "bg-orange-50 text-orange-700 ring-orange-200",
};

export default function Goals() {
  const { data: goals, isLoading } = useGetGoals({
    query: { queryKey: getGetGoalsQueryKey() },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Participant Goals</h1>
          <p className="mt-1 text-sm text-slate-500">Track NDIS and personal outcomes.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-52 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !goals?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <Target className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No goals recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const pct = goal.progress ?? 0;
            const catCls = categoryColor[goal.category] ?? "bg-slate-50 text-slate-600 ring-slate-200";
            return (
              <Card key={goal.id} className="flex flex-col rounded-2xl border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 border-0 ${catCls}`}>
                      {goal.category.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="outline" className={`rounded-full text-xs capitalize ${goal.status === "achieved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : goal.status === "on_hold" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {goal.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-900 leading-snug">{goal.title}</p>
                  <p className="text-xs font-medium text-violet-600 mt-1">{goal.participantName}</p>
                </CardHeader>
                <CardContent className="mt-auto space-y-4 pt-0">
                  {goal.description ? (
                    <p className="text-xs text-slate-500 line-clamp-2">{goal.description}</p>
                  ) : null}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-violet-500" : "bg-amber-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {goal.targetDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Target: {format(parseISO(goal.targetDate), "MMM d, yyyy")}</span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
