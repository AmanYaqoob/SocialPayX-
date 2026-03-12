import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { Home, ListTodo, Users, FileText, Wallet, Newspaper } from "lucide-react";
import { AuthContext } from "../App.jsx";
import apiService from "../services/api.js";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await apiService.getSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard", visible: true },
    { icon: Newspaper, label: "News", path: "/news", visible: true },
    { icon: Users, label: "Referral", path: "/referral", visible: settings?.referralEnabled !== false },
    { icon: FileText, label: "Whitepaper", path: "/whitepaper", visible: true },
    { icon: Wallet, label: "Wallet", path: "/wallet", visible: true },
  ].filter(item => item.visible);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 px-3 py-1 transition-all duration-300 ${
                isActive ? "nav-item-active" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
