import React from "react";
import { useRoute, Link } from "wouter";
import { useGetStaffMember, getGetStaffMemberQueryKey, useGetStaffCompliance, getGetStaffComplianceQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, ShieldAlert, ChevronLeft, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function StaffDetail() {
  const [, params] = useRoute("/staff/:id");
  const id = Number(params?.id);

  const { data: staff, isLoading: isLoadingStaff } = useGetStaffMember(id, {
    query: { enabled: !!id, queryKey: getGetStaffMemberQueryKey(id) }
  });

  const { data: compliance, isLoading: isLoadingCompliance } = useGetStaffCompliance(id, {
    query: { enabled: !!id, queryKey: getGetStaffComplianceQueryKey(id) }
  });

  if (isLoadingStaff || isLoadingCompliance) {
    return <div className="p-8">Loading staff profile...</div>;
  }

  if (!staff) {
    return <div className="p-8 text-center text-muted-foreground">Staff member not found.</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'expiring_soon': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'expired': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {staff.firstName} {staff.lastName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">{staff.role.replace(/_/g, ' ')}</Badge>
            <Badge variant="outline" className={staff.status === 'active' ? "bg-green-50 text-green-700" : ""}>{staff.status}</Badge>
            <Badge variant="outline" className="capitalize">{staff.employmentType?.replace(/_/g, ' ')}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><Mail className="w-4 h-4"/> Email</p>
                <p>{staff.email}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><Phone className="w-4 h-4"/> Phone</p>
                <p>{staff.phone || 'No phone recorded'}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-1">Joined</p>
                <p>{format(parseISO(staff.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Compliance & Certifications
              </CardTitle>
              {compliance?.overallStatus && (
                <Badge variant={compliance.overallStatus === 'compliant' ? 'default' : 'destructive'} className="capitalize">
                  {compliance.overallStatus.replace(/_/g, ' ')}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {compliance?.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(cert.status)}
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        {cert.number && <p className="text-xs text-muted-foreground font-mono">No: {cert.number}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 capitalize">{cert.status.replace(/_/g, ' ')}</Badge>
                      {cert.expiryDate && (
                        <p className="text-xs text-muted-foreground">
                          Exp: {format(parseISO(cert.expiryDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!compliance?.certifications || compliance.certifications.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">No certifications recorded.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
