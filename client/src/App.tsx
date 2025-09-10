import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Events from "@/pages/events";
import Reservations from "@/pages/reservations";
import Scores from "@/pages/scores";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMenu from "@/pages/admin/menu";
import AdminEvents from "@/pages/admin/events-admin";
import AdminReservations from "@/pages/admin/reservations-admin";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Loading...</div>
    </div>;
  }
  
  if (!isAdmin) {
    return <AdminLogin />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/" component={Landing} />
      <Route path="/menu" component={Menu} />
      <Route path="/events" component={Events} />
      <Route path="/reservations" component={Reservations} />
      <Route path="/scores" component={Scores} />
      
      {/* Admin login - always accessible */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Protected admin routes - require admin authentication */}
      <Route path="/admin" component={() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/dashboard" component={() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/menu" component={() => <ProtectedAdminRoute><AdminMenu /></ProtectedAdminRoute>} />
      <Route path="/admin/events" component={() => <ProtectedAdminRoute><AdminEvents /></ProtectedAdminRoute>} />
      <Route path="/admin/reservations" component={() => <ProtectedAdminRoute><AdminReservations /></ProtectedAdminRoute>} />
      <Route path="/admin/users" component={() => <ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" component={() => <ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
