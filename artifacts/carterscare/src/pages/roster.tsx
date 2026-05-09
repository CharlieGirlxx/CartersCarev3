import React from "react";
import { useGetShifts, getGetShiftsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function Roster() {
  const { data: shifts, isLoading } = useGetShifts({
    query: { queryKey: getGetShiftsQueryKey() }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return "bg-blue-100 text-blue-800";
      case 'in_progress': return "bg-amber-100 text-amber-800";
      case 'completed': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roster</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage shifts.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Shift
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}
             </div>
          ) : (
            <div className="space-y-4">
              {shifts?.map((shift) => (
                <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{shift.participantName}</h4>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <User className="w-3 h-3 mr-1" /> {shift.staffName}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> 
                        {format(parseISO(shift.startTime), "MMM d, h:mm a")} - {format(parseISO(shift.endTime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="capitalize">{shift.serviceType.replace(/_/g, ' ')}</Badge>
                    <Badge className={getStatusColor(shift.status)} variant="outline">{shift.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))}
              {(!shifts || shifts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No upcoming shifts.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
