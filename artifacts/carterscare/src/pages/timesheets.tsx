import React from "react";
import { useGetTimesheets, getGetTimesheetsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Timesheets() {
  const { data: timesheets, isLoading } = useGetTimesheets({
    query: { queryKey: getGetTimesheetsQueryKey() }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return "bg-green-100 text-green-800";
      case 'submitted': return "bg-blue-100 text-blue-800";
      case 'draft': return "bg-gray-100 text-gray-800";
      case 'paid': return "bg-purple-100 text-purple-800";
      case 'rejected': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground mt-1">Review and approve staff hours.</p>
        </div>
        <Button variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Submit Timesheet
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : timesheets?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No timesheets found.</TableCell></TableRow>
              ) : (
                timesheets?.map((ts) => (
                  <TableRow key={ts.id}>
                    <TableCell className="font-medium">{ts.staffName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(parseISO(ts.weekStart), 'MMM d')} - {format(parseISO(ts.weekEnd), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-mono">{ts.totalHours} hrs</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ts.status)} variant="outline">{ts.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {ts.status === 'submitted' ? (
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost">View</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
