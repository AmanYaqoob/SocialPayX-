import { useLocation, useNavigate } from "react-router-dom";
import { Newspaper, ClipboardList, LogOut, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useState } from "react";

const SubAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Newspaper,     label: "News",  path: "/subadmin/news"  },
    { icon: ClipboardList, label: "Tasks", path: "/subadmin/tasks" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("subadmin_token");
    localStorage.removeItem("subadmin_user");
    navigate("/subadmin/login");
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 ${collapsed ? "w-16" : "w-64"}`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center glow-primary">
              <BookOpen className="w-4 h-4 text-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm">Content Manager</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SubAdminSidebar;
