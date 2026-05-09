import React from "react";
import { useGetMedications, getGetMedicationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Medications() {
  const { data: medications, isLoading } = useGetMedications({
    query: { queryKey: getGetMedicationsQueryKey() }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-muted-foreground mt-1">Manage participant prescriptions and administrations.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      <Card className="border-muted shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Dosage & Route</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : medications?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No medications found.</TableCell></TableRow>
              ) : (
                medications?.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary" />
                        {med.name}
                      </div>
                    </TableCell>
                    <TableCell>{med.participantName}</TableCell>
                    <TableCell>
                      <span className="font-medium">{med.dosage}</span>
                      <Badge variant="outline" className="ml-2 capitalize">{med.route.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{med.frequency}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={med.isActive ? "bg-green-100 text-green-800" : ""}>
                        {med.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Administer</Button>
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
