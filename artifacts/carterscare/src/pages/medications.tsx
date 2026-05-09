import { useGetMedications, getGetMedicationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Plus, AlertCircle, ShieldAlert } from "lucide-react";

export default function Medications() {
  const { data: medications, isLoading } = useGetMedications({
    query: { queryKey: getGetMedicationsQueryKey() },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Medications</h1>
          <p className="mt-1 text-sm text-slate-500">Manage participant prescriptions and administration records.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Medication
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !medications?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <Pill className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No medications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <Card key={med.id} className="rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 shrink-0">
                      <Pill className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        {med.genericName ? (
                          <span className="text-xs text-slate-400">({med.genericName})</span>
                        ) : null}
                        {med.requiresWitness && (
                          <Badge className="rounded-full text-[10px] px-2 py-0.5 border-0 bg-amber-50 text-amber-700">
                            <ShieldAlert className="h-3 w-3 mr-1" />Witness Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-violet-600 font-medium mt-0.5">{med.participantName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="font-mono">{med.dosage} {med.unit}</span>
                        <span className="capitalize">{med.route?.replace(/_/g, " ")}</span>
                        <span>{med.frequency}</span>
                      </div>
                      {med.instructions ? (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{med.instructions}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`rounded-full text-xs ${med.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500"}`}>
                      {med.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs text-violet-600 hover:bg-violet-50 h-8 px-3">
                      Record
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
