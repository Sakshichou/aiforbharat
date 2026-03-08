import { Link, useLocation } from "react-router-dom";
import { Home, Camera, Mic, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const { pathname } = useLocation();
  const { role, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard", roles: ["citizen", "official"] },
    { path: "/report", icon: Camera, label: "Report", roles: ["citizen"] },
    { path: "/voice", icon: Mic, label: "Voice", roles: ["citizen"] },
    { path: "/officer", icon: Shield, label: "Officer", roles: ["official"] },
  ].filter((item) => role && item.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
