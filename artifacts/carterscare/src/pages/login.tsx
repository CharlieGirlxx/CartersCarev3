import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        toast({
          title: "Welcome back",
          description: "Successfully logged in to Carter's Care v3.",
        });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
        });
      }
    }
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate({ data: values });
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-[100px]" />
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-[100px]" />
        <div className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-[100px]" />
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
            {/* Colorful Pinwheel Logo SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_10s_linear_infinite]">
              <path d="M50 50 L50 10 A20 20 0 0 1 70 30 Z" fill="hsl(var(--chart-1))" />
              <path d="M50 50 L90 50 A20 20 0 0 1 70 70 Z" fill="hsl(var(--chart-2))" />
              <path d="M50 50 L50 90 A20 20 0 0 1 30 70 Z" fill="hsl(var(--chart-3))" />
              <path d="M50 50 L10 50 A20 20 0 0 1 30 30 Z" fill="hsl(var(--chart-4))" />
            </svg>
            <div className="absolute w-4 h-4 bg-background rounded-full z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Carter's Care <span className="text-primary font-normal">v3</span></h1>
          <p className="text-muted-foreground mt-2 text-center">NDIS & Aged Care Management Platform</p>
        </div>

        <Card className="w-full shadow-lg border-muted">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the cockpit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-semibold" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-sm">
          {['Rostering', 'Compliance', 'Case Notes', 'Timesheets', 'Incidents', 'Reports'].map((pill) => (
            <span key={pill} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium border border-border">
              {pill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
