import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { Home, Users, Wallet, Newspaper, ClipboardList, Rss, UserCircle } from "lucide-react";
import { AuthContext } from "../App.jsx";
import apiService from "../services/api.js";

const BottomNav = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useContext(AuthContext);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiService.getSettings()
      .then(s => setSettings(s))
      .catch(() => {});
  }, []);

  const navItems = [
    { icon: Home,          label: "Home",    path: "/dashboard" },
    { icon: Newspaper,     label: "News",    path: "/news" },
    { icon: Rss,           label: "Feed",    path: "/feed" },
    { icon: Wallet,        label: "Wallet",  path: "/wallet" },
    { icon: ClipboardList, label: "Tasks",   path: "/tasks" },
    { icon: UserCircle,    label: "Profile", path: "/profile" },
  ].filter(item => {
    // Hide referral tab if disabled in settings — kept in profile instead
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon     = item.icon;
          const isActive = location.pathname === item.path;

          // Profile tab: show user initial instead of icon when active
          const isProfile = item.path === "/profile";

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 transition-all duration-300 ${
                isActive ? "nav-item-active" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isProfile && user?.username ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/40"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
