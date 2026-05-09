import React from "react";
import { useRoute, Link } from "wouter";
import { useGetParticipant, getGetParticipantQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, AlertCircle, Contact, HeartPulse, Stethoscope, ChevronLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ParticipantDetail() {
  const [, params] = useRoute("/participants/:id");
  const id = Number(params?.id);

  const { data: participant, isLoading } = useGetParticipant(id, {
    query: { enabled: !!id, queryKey: getGetParticipantQueryKey(id) }
  });

  if (isLoading) {
    return <div className="p-8">Loading participant profile...</div>;
  }

  if (!participant) {
    return <div className="p-8 text-center text-muted-foreground">Participant not found.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/participants">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {participant.preferredName || participant.firstName} {participant.lastName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">{participant.fundingType.replace(/_/g, ' ')}</Badge>
            <Badge variant="outline" className={participant.status === 'active' ? "bg-green-50 text-green-700" : ""}>{participant.status}</Badge>
            <Badge variant="outline">NDIS: {participant.ndisNumber || 'N/A'}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>{format(parseISO(participant.dateOfBirth), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="capitalize">{participant.gender || 'Not specified'}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><Phone className="w-4 h-4"/> Contact</p>
                <p>{participant.phone || 'No phone'}</p>
                <p>{participant.email || 'No email'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><MapPin className="w-4 h-4"/> Address</p>
                <p>{participant.address || 'No address specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participant.emergencyContactName ? (
                <div>
                  <p className="font-medium">{participant.emergencyContactName}</p>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" /> {participant.emergencyContactPhone}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No emergency contact provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-primary" />
                Care Needs & Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary Diagnosis</p>
                <p>{participant.primaryDiagnosis || 'None recorded'}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Support Level</p>
                <p>{participant.supportLevel || 'Standard'}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <Badge variant="outline" className="mt-1 capitalize">{participant.riskLevel || 'Not assessed'}</Badge>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">NDIS Goals</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                  {participant.ndisGoals || 'No goals documented yet.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
