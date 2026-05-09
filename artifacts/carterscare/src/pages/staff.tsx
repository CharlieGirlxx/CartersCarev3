import { useState } from "react";
import { Link } from "wouter";
import { useGetStaff, getGetStaffQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, ChevronRight, ShieldAlert } from "lucide-react";

const roleColor: Record<string, string> = {
  coordinator:    "bg-violet-50 text-violet-700 border-violet-200",
  support_worker: "bg-cyan-50 text-cyan-700 border-cyan-200",
  nurse:          "bg-rose-50 text-rose-700 border-rose-200",
  team_leader:    "bg-amber-50 text-amber-700 border-amber-200",
  admin:          "bg-slate-50 text-slate-700 border-slate-200",
};

export default function Staff() {
  const [search, setSearch] = useState("");

  const { data: staff, isLoading } = useGetStaff({
    query: { queryKey: getGetStaffQueryKey() },
  });

  const filtered = staff?.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Staff Directory</h1>
          <p className="mt-1 text-sm text-slate-500">Manage workers and their compliance.</p>
        </div>
        <Button className="rounded-full bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:bg-violet-700 w-fit">
          <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search staff…"
          className="pl-9 h-10 rounded-full border-slate-200 bg-white/80 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : !filtered?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center text-sm text-slate-500">
          No staff found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Link key={s.id} href={`/staff/${s.id}`}>
              <Card className="cursor-pointer rounded-2xl border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-sm shrink-0">
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{s.firstName} {s.lastName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0 capitalize ${roleColor[s.role] ?? "bg-slate-50 text-slate-600"}`}>
                        {s.role.replace(/_/g, " ")}
                      </Badge>
                      {s.employmentType ? (
                        <span className="text-[11px] text-slate-400 capitalize">{s.employmentType.replace(/_/g, " ")}</span>
                      ) : null}
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{s.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 capitalize hidden sm:inline-flex ${s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500"}`}>
                      {s.status}
                    </Badge>
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
