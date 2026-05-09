import React from "react";
import { useGetGoals, getGetGoalsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";

export default function Goals() {
  const { data: goals, isLoading } = useGetGoals({
    query: { queryKey: getGetGoalsQueryKey() }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participant Goals</h1>
          <p className="text-muted-foreground mt-1">Track NDIS and personal outcomes.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/50" />)
        ) : goals?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No goals found.
          </div>
        ) : (
          goals?.map((goal) => (
            <Card key={goal.id} className="border-muted shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="capitalize">{goal.category.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={goal.status === 'achieved' ? 'bg-green-50 text-green-700' : ''}>
                    {goal.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{goal.description}</CardTitle>
                <p className="text-sm text-primary font-medium mt-1">{goal.participantName}</p>
              </CardHeader>
              <CardContent className="mt-auto pt-4 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{goal.progressPercentage}%</span>
                  </div>
                  <Progress value={goal.progressPercentage} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Start: {format(parseISO(goal.startDate), 'MMM yyyy')}</span>
                  {goal.targetDate && <span>Target: {format(parseISO(goal.targetDate), 'MMM yyyy')}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
