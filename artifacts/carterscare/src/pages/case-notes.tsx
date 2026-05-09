import React from "react";
import { useGetCaseNotes, getGetCaseNotesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Flag } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function CaseNotes() {
  const { data: notes, isLoading } = useGetCaseNotes({
    query: { queryKey: getGetCaseNotesQueryKey() }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Notes</h1>
          <p className="text-muted-foreground mt-1">Documentation and progress records.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/50" />)
        ) : (
          notes?.map((note) => (
            <Card key={note.id} className="border-muted shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="capitalize mb-2">
                    {note.category.replace(/_/g, ' ')}
                  </Badge>
                  {note.requiresFollowUp && <Flag className="w-4 h-4 text-amber-500" />}
                </div>
                <CardTitle className="text-base">{note.participantName}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(note.createdAt), "MMM d, yyyy 'at' h:mm a")} • {note.staffName}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3 text-muted-foreground">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {(!notes || notes.length === 0) && !isLoading && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          No case notes recorded yet.
        </div>
      )}
    </div>
  );
}
