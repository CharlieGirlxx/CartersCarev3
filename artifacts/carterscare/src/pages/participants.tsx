import { useState } from "react";
import { Link } from "wouter";
import { useGetParticipants, getGetParticipantsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, ChevronRight, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fundingColor: Record<string, string> = {
  ndis:                    "bg-blue-50 text-blue-700 border-blue-200",
  aged_care_commonwealth:  "bg-purple-50 text-purple-700 border-purple-200",
  aged_care_state:         "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

const riskColor: Record<string, string> = {
  high:   "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low:    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Participants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const { data: participants, isLoading } = useGetParticipants({
    query: { queryKey: getGetParticipantsQueryKey() },
  });

  const filtered = participants?.filter((p) => {
    const matchSearch =
      p.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.lastName.toLowerCase().includes(search.toLowerCase()) ||
      (p.ndisNumber && p.ndisNumber.includes(search));
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Participants</h1>
          <p className="mt-1 text-sm text-slate-500">Manage care recipients and their profiles.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <UserPlus className="mr-2 h-4 w-4" /> Add Participant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or NDIS number…"
            className="pl-9 h-10 rounded-full border-slate-200 bg-white/80 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 h-10 rounded-full border-slate-200 bg-white/80 shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="waitlist">Waitlist</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !filtered?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center text-sm text-slate-500">
          No participants found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/participants/${p.id}`}>
              <Card className="cursor-pointer rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-sm shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {p.preferredName || p.firstName} {p.lastName}
                      </p>
                      {p.riskLevel === "high" && (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0 capitalize ${fundingColor[p.fundingType] ?? "bg-slate-50 text-slate-600"}`}>
                        {p.fundingType.replace(/_/g, " ")}
                      </Badge>
                      {p.ndisNumber || p.agedCareId ? (
                        <span className="text-[11px] text-slate-400 font-mono">{p.ndisNumber || p.agedCareId}</span>
                      ) : null}
                      {p.primaryDiagnosis ? (
                        <span className="text-[11px] text-slate-500 truncate hidden sm:inline">{p.primaryDiagnosis}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.riskLevel ? (
                      <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 capitalize hidden sm:inline-flex ${riskColor[p.riskLevel] ?? ""}`}>
                        {p.riskLevel}
                      </Badge>
                    ) : null}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
