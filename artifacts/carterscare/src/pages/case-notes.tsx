import { useGetCaseNotes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Flag, Lock, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

const categoryColor: Record<string, string> = {
  progress_note:        "bg-blue-50 text-blue-700 border-blue-200",
  health_update:        "bg-rose-50 text-rose-700 border-rose-200",
  personal_care:        "bg-violet-50 text-violet-700 border-violet-200",
  community_participation: "bg-emerald-50 text-emerald-700 border-emerald-200",
  goal_update:          "bg-amber-50 text-amber-700 border-amber-200",
  incident_related:     "bg-orange-50 text-orange-700 border-orange-200",
  medication:           "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function CaseNotes() {
  const { data: notes, isLoading } = useGetCaseNotes();

  

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Case Notes</h1>
          <p className="mt-1 text-sm text-slate-500">Documentation and progress records.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-52 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !notes?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
          <FileText className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No case notes recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => {
            const catCls = categoryColor[note.category] ?? "bg-slate-50 text-slate-600 border-slate-200";
            return (
              <Card key={note.id} className="flex flex-col rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 capitalize ${catCls}`}>
                      {note.category.replace(/_/g, " ")}
                    </Badge>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {note.isConfidential && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                      {note.requiresFollowUp && <Flag className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900">{note.participantName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {note.staffName} · {format(parseISO(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 px-4 pb-4">
                  <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">{note.content}</p>
                  {note.requiresFollowUp && note.followUpDate ? (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5">
                      <Flag className="h-3 w-3 text-amber-500 shrink-0" />
                      <p className="text-[11px] text-amber-700">Follow-up: {format(parseISO(note.followUpDate), "MMM d, yyyy")}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
