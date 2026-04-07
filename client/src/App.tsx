import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AppSidebar from "@/components/AppSidebar";
import TruthClaims from "@/pages/TruthClaims";
import AxiomDetail from "@/pages/AxiomDetail";
import NewSynthesis from "@/pages/NewSynthesis";
import CoreTensions from "@/pages/CoreTensions";
import Revisions from "@/pages/Revisions";
import Constitution from "@/pages/Constitution";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <div className="flex h-screen bg-background overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={TruthClaims} />
              <Route path="/axiom/:id" component={AxiomDetail} />
              <Route path="/new" component={NewSynthesis} />
              <Route path="/tensions" component={CoreTensions} />
              <Route path="/revisions" component={Revisions} />
              <Route path="/constitution" component={Constitution} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
