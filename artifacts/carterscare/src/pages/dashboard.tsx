import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle, CalendarClock, Activity, ArrowRight, ShieldCheck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  if (isLoadingSummary || isLoadingActivity) {
    return <div className="p-8 space-y-6"><div className="h-8 w-48 rounded bg-muted animate-pulse" /><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}</div></div>;
  }

  const statCards = [
    { title: "Active Participants", value: summary?.totalParticipants || 0, icon: Users, color: "text-violet-600", trend: "+2 this week" },
    { title: "Shifts Today", value: summary?.activeShiftsToday || 0, icon: Clock, color: "text-cyan-600", trend: `${summary?.upcomingShifts || 0} upcoming` },
    { title: "Open Incidents", value: summary?.openIncidents || 0, icon: AlertCircle, color: summary?.openIncidents ? "text-rose-600" : "text-slate-400", trend: "Requires attention" },
    { title: "Pending Timesheets", value: summary?.pendingTimesheets || 0, icon: CalendarClock, color: "text-amber-600", trend: "Needs approval" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Operations Cockpit</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time overview of care delivery and compliance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full border-slate-200 bg-white/70 shadow-sm">Download Report</Button>
          <Button className="rounded-full bg-violet-600 text-white shadow-[0_10px_24px_rgba(124,58,237,0.25)] hover:bg-violet-700">View Roster</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="rounded-3xl border-white/70 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</div>
              <p className="mt-1 text-xs text-slate-500">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 rounded-3xl border-white/70 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-violet-600" />Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {activity?.map((item) => (
                <div key={item.id} className="relative flex gap-4">
                  <div className="z-10 mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500 ring-4 ring-white" />
                  <div className="absolute left-[3px] top-4 bottom-[-1.25rem] w-px bg-slate-200 last:hidden" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-800">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{item.userName}</span>
                      {item.participantName ? <><span>•</span><span className="text-violet-600">{item.participantName}</span></> : null}
                      <span>•</span>
                      <span>{format(parseISO(item.timestamp), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!activity?.length ? <div className="py-8 text-center text-sm text-slate-500">No recent activity</div> : null}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="rounded-3xl border-white/70 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-emerald-600" />Compliance Score</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" /><circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - (summary?.complianceScore || 0) / 100)}`} className="text-violet-600 transition-all duration-1000 ease-out" /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold">{summary?.complianceScore || 0}%</span></div>
              </div>
              <p className="text-center text-sm text-slate-500">{summary?.expiringCertifications} certifications expiring soon</p>
              <Button variant="link" className="mt-2 h-auto py-1 text-violet-600">Review Standards <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-white/70 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Banknote className="h-5 w-5 text-cyan-600" />Budget Utilisation</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4"><div className="flex items-end justify-between"><span className="text-3xl font-semibold">{summary?.budgetUtilisation || 0}%</span><span className="mb-1 text-sm text-slate-500">overall average</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-600" style={{ width: `${summary?.budgetUtilisation || 0}%` }} /></div><p className="text-xs text-slate-500">Tracking slightly higher than expected for this period.</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
