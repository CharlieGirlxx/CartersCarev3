import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Participants from "./pages/participants";
import ParticipantDetail from "./pages/participant-detail";
import Staff from "./pages/staff";
import StaffDetail from "./pages/staff-detail";
import Roster from "./pages/roster";
import CaseNotes from "./pages/case-notes";
import Incidents from "./pages/incidents";
import Timesheets from "./pages/timesheets";
import Medications from "./pages/medications";
import Compliance from "./pages/compliance";
import ServiceAgreements from "./pages/service-agreements";
import Goals from "./pages/goals";
import { useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <Component {...rest} />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => {
        const [, setLocation] = useLocation();
        useEffect(() => setLocation("/dashboard"), [setLocation]);
        return null;
      }} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/participants">{() => <ProtectedRoute component={Participants} />}</Route>
      <Route path="/participants/:id">{() => <ProtectedRoute component={ParticipantDetail} />}</Route>
      <Route path="/staff">{() => <ProtectedRoute component={Staff} />}</Route>
      <Route path="/staff/:id">{() => <ProtectedRoute component={StaffDetail} />}</Route>
      <Route path="/roster">{() => <ProtectedRoute component={Roster} />}</Route>
      <Route path="/timesheets">{() => <ProtectedRoute component={Timesheets} />}</Route>
      <Route path="/case-notes">{() => <ProtectedRoute component={CaseNotes} />}</Route>
      <Route path="/incidents">{() => <ProtectedRoute component={Incidents} />}</Route>
      <Route path="/medications">{() => <ProtectedRoute component={Medications} />}</Route>
      <Route path="/compliance">{() => <ProtectedRoute component={Compliance} />}</Route>
      <Route path="/service-agreements">{() => <ProtectedRoute component={ServiceAgreements} />}</Route>
      <Route path="/goals">{() => <ProtectedRoute component={Goals} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
