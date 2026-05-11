import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetParticipant, getGetParticipantQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Phone, MapPin, AlertCircle, Contact, HeartPulse, Stethoscope, ChevronLeft, Calendar, FileText, Briefcase } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantCalendar } from "@/components/shifts/ParticipantCalendar";
import { ShiftEditor } from "@/components/shifts/ShiftEditor";

export default function ParticipantDetail() {
  const [, params] = useRoute("/participants/:id");
  const id = Number(params?.id);
  const [activeTab, setActiveTab] = useState("overview");
  const [showShiftEditor, setShowShiftEditor] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);

  const { data: participant, isLoading } = useGetParticipant(id, {
    query: { enabled: !!id, queryKey: getGetParticipantQueryKey(id) }
  });

  const handleAddShift = () => {
    setShowShiftEditor(true);
  };

  const handleSaveShift = (shiftData: any) => {
    // TODO: Save to API
    setShifts([...shifts, { ...shiftData, id: Date.now() }]);
    setShowShiftEditor(false);
  };

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
        <div className="flex-1">
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="goals" className="hidden lg:flex">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Shifts Tab - PHASE 5 INTEGRATION */}
        <TabsContent value="shifts" className="space-y-6">
          <ParticipantCalendar 
            participantId={id}
            shifts={shifts}
            onAddShift={handleAddShift}
            view="month"
          />

          {/* Shift Editor Dialog */}
          <Dialog open={showShiftEditor} onOpenChange={setShowShiftEditor}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Shift</DialogTitle>
              </DialogHeader>
              <ShiftEditor 
                participantId={id}
                onSave={handleSaveShift}
                onCancel={() => setShowShiftEditor(false)}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Case Notes
              </CardTitle>
              <Button size="sm" variant="outline">Add Note</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Case notes will display here. See Case Notes page for full history.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Incident History
              </CardTitle>
              <Button size="sm" variant="outline">Report Incident</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Recent incidents will display here. See Incidents page for full history.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Documents & Plans
              </CardTitle>
              <Button size="sm" variant="outline">Upload Document</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Support plans, agreements, and medical records will display here. See Compliance section for document management.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">NDIS Goals & Outcomes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Goals</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                  {participant.ndisGoals || 'No goals documented yet.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
