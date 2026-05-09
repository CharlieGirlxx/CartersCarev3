import React from "react";
import { useGetServiceAgreements, getGetServiceAgreementsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function ServiceAgreements() {
  const { data: agreements, isLoading } = useGetServiceAgreements({
    query: { queryKey: getGetServiceAgreementsQueryKey() }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Agreements</h1>
          <p className="text-muted-foreground mt-1">Manage funding contracts and budgets.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Agreement
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="w-48">Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : agreements?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No agreements found.</TableCell></TableRow>
              ) : (
                agreements?.map((ag) => {
                  const utilPct = ag.allocatedBudget && ag.usedBudget 
                    ? (ag.usedBudget / ag.allocatedBudget) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={ag.id}>
                      <TableCell className="font-medium">{ag.participantName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{ag.fundingType.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(parseISO(ag.startDate), 'MMM yyyy')} - {format(parseISO(ag.endDate), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {ag.allocatedBudget ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>${ag.usedBudget?.toLocaleString()}</span>
                              <span className="text-muted-foreground">${ag.allocatedBudget.toLocaleString()}</span>
                            </div>
                            <Progress value={utilPct} className={`h-2 ${utilPct > 90 ? 'bg-red-200' : ''}`} indicatorClassName={utilPct > 90 ? 'bg-red-500' : 'bg-primary'} />
                          </div>
                        ) : <span className="text-muted-foreground text-sm">Not specified</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ag.status === 'active' ? "bg-green-50 text-green-700" : ""}>{ag.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Review</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
