import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken, setUser } = useAuth();
  const { toast } = useToast();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "parker@cdxi.au",
      password: "220191",
    },
  });
  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setUser(data.user);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Check your email and password.",
        });
      },
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(196,181,253,0.55),transparent_30%),radial-gradient(circle_at_top_right,rgba(191,219,254,0.55),transparent_30%),linear-gradient(135deg,#eef2ff_0%,#f8fafc_55%,#e0f2fe_100%)] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-16 w-60 h-60 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-sky-300/35 blur-3xl" />
        <div className="absolute top-24 right-0 w-80 h-80 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>
      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-6 w-20 h-20 overflow-hidden rounded-2xl shadow-[0_12px_35px_rgba(15,23,42,0.12)] ring-1 ring-white/70 bg-white flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-[conic-gradient(from_180deg,#f59e0b,#ef4444,#8b5cf6,#0ea5e9,#22c55e,#f59e0b)]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Carter's <span className="text-violet-600">Care</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Care Management Platform
          </p>
          <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
            Streamline your NDIS and aged care operations — rostering, compliance, incidents, timesheets and more.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {["Rostering", "Compliance", "Case Notes", "Timesheets", "Incidents", "Reports"].map((pill) => (
              <span key={pill} className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/70">
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <div className="mb-6 rounded-t-[22px] border-t-4 border-t-violet-500 pt-2">
              <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your Carter's Care account</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => loginMutation.mutate({ data: values }))} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="you@example.com" className="h-11 rounded-xl border-slate-200 bg-white/70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" className="h-11 rounded-xl border-slate-200 bg-white/70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="h-11 w-full rounded-xl bg-violet-600 text-white shadow-[0_10px_24px_rgba(124,58,237,0.28)] hover:bg-violet-700" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-xs text-slate-400">Contact your administrator for account access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
