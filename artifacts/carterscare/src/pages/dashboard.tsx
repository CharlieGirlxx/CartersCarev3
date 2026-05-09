import React from "react";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, AlertCircle, CalendarClock, Activity, ArrowRight, ShieldCheck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });
  
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() }
  });

  if (isLoadingSummary || isLoadingActivity) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Active Participants", value: summary?.totalParticipants || 0, icon: Users, color: "text-blue-500", trend: "+2 this week" },
    { title: "Shifts Today", value: summary?.activeShiftsToday || 0, icon: Clock, color: "text-green-500", trend: `${summary?.upcomingShifts || 0} upcoming` },
    { title: "Open Incidents", value: summary?.openIncidents || 0, icon: AlertCircle, color: summary?.openIncidents ? "text-destructive" : "text-muted-foreground", trend: "Requires attention" },
    { title: "Pending Timesheets", value: summary?.pendingTimesheets || 0, icon: CalendarClock, color: "text-amber-500", trend: "Needs approval" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Cockpit</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of care delivery and compliance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>View Roster</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-muted shadow-sm flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {activity?.map((item) => (
                <div key={item.id} className="flex gap-4 relative">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 z-10 ring-4 ring-background" />
                  <div className="absolute left-[3px] top-4 bottom-[-1.5rem] w-px bg-border last:hidden" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.userName}</span>
                      {item.participantName && (
                        <>
                          <span>•</span>
                          <span className="text-primary/80">{item.participantName}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{format(parseISO(item.timestamp), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!activity || activity.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 40}`} 
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (summary?.complianceScore || 0) / 100)}`}
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{summary?.complianceScore || 0}%</span>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {summary?.expiringCertifications} certifications expiring soon
              </p>
              <Button variant="link" className="mt-2 h-auto py-1">Review Standards <ArrowRight className="w-4 h-4 ml-1"/></Button>
            </CardContent>
          </Card>

          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Banknote className="w-5 h-5 text-indigo-600" />
                Budget Utilisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">{summary?.budgetUtilisation || 0}%</span>
                  <span className="text-sm text-muted-foreground mb-1">overall average</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${summary?.budgetUtilisation || 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracking slightly higher than expected for this period.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
