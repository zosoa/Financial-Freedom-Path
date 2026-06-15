import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Calculator from "@/pages/calculator";
import Results from "@/pages/results";
import Report from "@/pages/report";
import RiskDNA from "@/pages/risk-dna";
import LearnPage from "@/pages/learn";
import MarchePage from "@/pages/marche";
import PulsePage from "@/pages/pulse";
import AdminPage from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/results" component={Results} />
      <Route path="/risk-dna" component={RiskDNA} />
      <Route path="/report/:id" component={Report} />
      <Route path="/learn" component={LearnPage} />
      <Route path="/learn/:slug" component={LearnPage} />
      <Route path="/marche" component={MarchePage} />
      <Route path="/marche/:date" component={MarchePage} />
      <Route path="/pulse" component={PulsePage} />
      <Route path="/pulse/:date" component={PulsePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
