import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Axiom, Tension, Revision } from "@shared/schema";

const AxiomLogo = () => (
  <svg aria-label="Axiom" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="26" height="26" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 21L14 7L22 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 16.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const navItems = [
  {
    href: "/",
    label: "Truth Claims",
    shortLabel: "TRUTH CLAIMS",
    queryKey: "/api/axioms",
  },
  {
    href: "/tensions",
    label: "Core Tensions",
    shortLabel: "TENSIONS",
    queryKey: "/api/tensions",
  },
  {
    href: "/revisions",
    label: "Revisions",
    shortLabel: "REVISIONS",
    queryKey: "/api/revisions",
  },
  {
    href: "/constitution",
    label: "Constitution",
    shortLabel: "CONSTITUTION",
    queryKey: null,
  },
];

function NavCount({ queryKey }: { queryKey: string | null }) {
  const { data } = useQuery<any[]>({
    queryKey: [queryKey],
    enabled: !!queryKey,
  });
  if (!queryKey || !data) return null;
  return (
    <span className="font-mono text-xs text-sidebar-foreground/40 tabular-nums">
      {data.length}
    </span>
  );
}

export default function AppSidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location === "";
    return location.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col bg-sidebar border-r border-sidebar-border"
      style={{ width: 220, minWidth: 220 }}
      data-testid="app-sidebar"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 pt-7 pb-6">
        <span className="text-sidebar-foreground/60">
          <AxiomLogo />
        </span>
        <div>
          <div
            className="text-sidebar-foreground font-mono text-sm font-medium tracking-widest-constitutional uppercase"
          >
            AXIOM
          </div>
          <div className="text-sidebar-foreground/35 text-[10px] tracking-wider font-mono uppercase mt-0.5">
            Synthesis Layer
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-sidebar-border mb-4" />

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer transition-colors duration-150 group ${
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
              data-testid={`nav-${item.href.replace("/", "") || "home"}`}
            >
              <span className={`text-xs tracking-widest-constitutional font-mono uppercase ${
                isActive(item.href) ? "text-sidebar-foreground" : ""
              }`}>
                {item.shortLabel}
              </span>
              <NavCount queryKey={item.queryKey} />
            </div>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-sidebar-border mt-4 mb-4" />

      {/* New Synthesis CTA */}
      <div className="px-3">
        <Link href="/new">
          <div
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-sm cursor-pointer transition-colors duration-150 ${
              isActive("/new")
                ? "bg-sidebar-primary/20 text-sidebar-primary"
                : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/30"
            }`}
            data-testid="nav-new"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 1v12M1 7h12"/>
            </svg>
            <span className="text-xs tracking-widest-constitutional font-mono uppercase">
              New Synthesis
            </span>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 pb-6">
        <div className="text-[10px] text-sidebar-foreground/25 font-mono uppercase tracking-wider leading-relaxed">
          AXIOM OS<br />
          Fourth Tool
        </div>
      </div>
    </aside>
  );
}
