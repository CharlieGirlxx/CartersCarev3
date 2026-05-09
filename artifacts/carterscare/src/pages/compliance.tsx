import React from "react";
import { useGetComplianceChecks, getGetComplianceChecksQueryKey, useGetExpiringCompliance, getGetExpiringComplianceQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Compliance() {
  const { data: checks, isLoading: isLoadingChecks } = useGetComplianceChecks({
    query: { queryKey: getGetComplianceChecksQueryKey() }
  });

  const { data: expiring, isLoading: isLoadingExpiring } = useGetExpiringCompliance({
    query: { queryKey: getGetExpiringComplianceQueryKey() }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'non_compliant': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compliance & Quality</h1>
        <p className="text-muted-foreground mt-1">Track adherence to NDIS and Aged Care Quality Standards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Standards Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingChecks ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {checks?.map((check) => (
                    <div key={check.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 bg-card">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(check.status)}
                        <div>
                          <h4 className="font-semibold">{check.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="capitalize text-xs">{check.framework.replace(/_/g, ' ')}</Badge>
                            <span className="text-xs text-muted-foreground capitalize">{check.category.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className="capitalize mb-1">{check.status.replace(/_/g, ' ')}</Badge>
                        <span className="text-xs text-muted-foreground">Due: {format(parseISO(check.nextReviewDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                  {(!checks || checks.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">No compliance checks recorded.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-destructive shadow-sm border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Expiring Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingExpiring ? (
                 <div className="space-y-4">
                   {[1,2].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                 </div>
              ) : (
                <div className="space-y-3">
                  {expiring?.map((item, i) => (
                    <div key={i} className="p-3 border rounded bg-muted/20">
                      <p className="font-medium text-sm">{item.itemName}</p>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-xs text-muted-foreground">{item.entityName} ({item.entityType})</p>
                        <Badge variant="destructive" className="text-[10px]">{format(parseISO(item.expiryDate), 'MMM d')}</Badge>
                      </div>
                    </div>
                  ))}
                  {(!expiring || expiring.length === 0) && (
                    <div className="text-center py-6 text-sm text-green-600">All items are up to date!</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
