import { Link } from "wouter";
import { Home, CircleDot, Compass, FlaskConical, Zap, Ghost } from "lucide-react";

const LUMEN_HUB_URL = "https://lumen-os.up.railway.app";
const CURRENT_APP = "axiom";

const APP_NAV = [
  { key: "parallax", href: "https://parallaxapp.up.railway.app/", icon: Compass, label: "Parallax" },
  { key: "praxis", href: "https://praxis-app.up.railway.app/", icon: FlaskConical, label: "Praxis" },
  { key: "axiom", href: "https://axiomtool-production.up.railway.app/#/", icon: Zap, label: "Axiom" },
  { key: "liminal", href: "https://liminal-app.up.railway.app/", icon: Ghost, label: "Liminal" },
];

export default function BottomNav() {
  return (
    <nav
      data-testid="nav-bottom"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border bg-sidebar/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Top row: Lumen Home + App Home */}
      <div className="flex border-b border-sidebar-border/30">
        <a
          href={LUMEN_HUB_URL}
          data-testid="nav-bottom-lumen"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
        >
          <CircleDot className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] font-mono uppercase tracking-wider">lumen</span>
        </a>
        <div className="w-px bg-sidebar-border/30" />
        <Link
          href="/"
          data-testid="nav-bottom-app-home"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
        >
          <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] font-mono uppercase tracking-wider">axiom</span>
        </Link>
      </div>

      {/* Bottom row: 4 sub-apps */}
      <div className="flex items-center justify-around px-2 py-1">
        {APP_NAV.map(({ key, href, icon: Icon, label }) => {
          const isSelf = key === CURRENT_APP;
          return (
            <a
              key={key}
              href={isSelf ? "/" : href}
              data-testid={`nav-bottom-${key}`}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-2 rounded-lg transition-all min-h-[44px] min-w-[44px] ${
                isSelf
                  ? "text-[hsl(var(--sidebar-primary))]"
                  : "text-sidebar-foreground/30 hover:text-sidebar-foreground/60"
              }`}
              {...(!isSelf ? { target: "_self" } : {})}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={isSelf ? 2 : 1.5} />
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelf ? "text-[hsl(var(--sidebar-primary))]/80" : "text-sidebar-foreground/25"}`}>
                {label.toLowerCase()}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
