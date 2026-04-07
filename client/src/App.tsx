import { useState, useEffect } from 'react';
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

function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'unauth'>('loading');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (r.ok) setStatus('ok');
        else setStatus('unauth');
      })
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f1117', color: '#8D99AE', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.08em' }}>
        AXIOM
      </div>
    );
  }

  if (status === 'unauth') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f1117', color: '#8D99AE', fontFamily: 'monospace', textAlign: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FFD166', marginBottom: '0.5rem' }}>AXIOM</div>
        <div style={{ fontSize: '13px', color: '#8D99AE' }}>Authentication required.</div>
        <div style={{ fontSize: '12px', color: '#8D99AE', opacity: 0.6 }}>Enter this tool from within Lumen.</div>
        <a href="https://lumen-os.up.railway.app" style={{ marginTop: '1rem', fontSize: '11px', color: '#FFD166', textDecoration: 'none', letterSpacing: '0.1em', border: '1px solid rgba(255,209,102,0.3)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
          Go to Lumen →
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthGate>
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
    </AuthGate>
  );
}

export default App;
