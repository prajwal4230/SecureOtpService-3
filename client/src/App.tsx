import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AddBalancePage from "@/pages/add-balance-page";
import GetOTPsPage from "@/pages/get-otps-page";
import CheckOTPPage from "@/pages/check-otp-page";
import SupportPage from "@/pages/support-page";
import TermsPage from "@/pages/terms-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

// Wrap components to ensure they always return an Element (not null)
const WrappedHomePage = () => <HomePage />;
const WrappedAuthPage = () => <AuthPage />;
const WrappedNotFound = () => <NotFound />;
const WrappedDashboardPage = () => <DashboardPage />;
const WrappedAddBalancePage = () => <AddBalancePage />;
const WrappedGetOTPsPage = () => <GetOTPsPage />;
const WrappedCheckOTPPage = () => <CheckOTPPage />;
const WrappedSupportPage = () => <SupportPage />;
const WrappedTermsPage = () => <TermsPage />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={WrappedHomePage} />
      <Route path="/auth" component={WrappedAuthPage} />
      <Route path="/terms" component={WrappedTermsPage} />
      <ProtectedRoute path="/dashboard" component={WrappedDashboardPage} />
      <ProtectedRoute path="/add-balance" component={WrappedAddBalancePage} />
      <ProtectedRoute path="/get-otps" component={WrappedGetOTPsPage} />
      <ProtectedRoute path="/check-otp" component={WrappedCheckOTPPage} />
      <ProtectedRoute path="/support" component={WrappedSupportPage} />
      <Route component={WrappedNotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
