import React from "react";
import { useGetIncidents, getGetIncidentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Incidents() {
  const { data: incidents, isLoading } = useGetIncidents({
    query: { queryKey: getGetIncidentsQueryKey() }
  });

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return "bg-red-600 text-white hover:bg-red-700";
      case 'high': return "bg-orange-500 text-white hover:bg-orange-600";
      case 'medium': return "bg-amber-400 text-amber-950 hover:bg-amber-500";
      case 'low': return "bg-blue-400 text-blue-950 hover:bg-blue-500";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground mt-1">Manage and report incidents.</p>
        </div>
        <Button variant="destructive">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reportable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : incidents?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No incidents found.</TableCell></TableRow>
              ) : (
                incidents?.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{format(parseISO(incident.incidentDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{incident.participantName}</TableCell>
                    <TableCell className="capitalize">{incident.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{incident.status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {incident.reportableToNDIS && <Badge variant="secondary" className="text-xs">NDIS</Badge>}
                        {incident.reportableToAgedCare && <Badge variant="secondary" className="text-xs">AC</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
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
