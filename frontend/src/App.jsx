import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext, useEffect } from "react";
import apiService from "./services/api.js";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Wallet from "./pages/Wallet.jsx";
import Referral from "./pages/Referral.jsx";
import KYC from "./pages/KYC.jsx";
import Whitepaper from "./pages/Whitepaper.jsx";
import Reels from "./pages/Reels.jsx";
import Profile from "./pages/Profile.jsx";
import EmailVerification from "./pages/EmailVerification.jsx";
import News from "./pages/News.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import NotFound from "./pages/NotFound.jsx";
import Tasks from "./pages/Tasks.jsx";
import SocialFeed from "./pages/SocialFeed.jsx";
// Admin imports
import AdminLogin from "./pages/admin/AdminLogin.jsx";
// Sub-Admin imports
import SubAdminLogin from "./pages/admin/SubAdminLogin.jsx";
import SubAdminNews from "./pages/admin/SubAdminNews.jsx";
import SubAdminTasks from "./pages/admin/SubAdminTasks.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminKYC from "./pages/admin/AdminKYC.jsx";
import AdminMining from "./pages/admin/AdminMining.jsx";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminNews from "./pages/admin/AdminNews.jsx";
import AdminTasks from "./pages/admin/AdminTasks.jsx";

const queryClient = new QueryClient();

export const AuthContext = createContext(null);

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      apiService.setToken(token);
      apiService.getProfile()
        .then(profile => {
          setUser(profile);
          setIsAuthenticated(true);
          // Migrate any sessionStorage token to localStorage for persistence
          if (!localStorage.getItem("token")) {
            localStorage.setItem("token", token);
            sessionStorage.removeItem("token");
          }
        })
        .catch(() => {
          // Token expired or invalid — clear everything so user sees login
          apiService.removeToken();
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token, rememberMe = true) => {
    setUser(userData);
    setIsAuthenticated(true);
    apiService.setToken(token);
    // Always save to localStorage so login survives tab/browser close
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    apiService.removeToken();
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/ref/:code" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/whitepaper" element={<Whitepaper />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/feed" element={<SocialFeed />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/tasks" element={<AdminTasks />} />
              <Route path="/admin/kyc" element={<AdminKYC />} />
              <Route path="/admin/mining" element={<AdminMining />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

              <Route path="*" element={<NotFound />} />

              {/* Sub-Admin Routes */}
              <Route path="/subadmin/login" element={<SubAdminLogin />} />
              <Route path="/subadmin/dashboard" element={<AdminDashboard />} />
              <Route path="/subadmin/users" element={<AdminUsers />} />
              <Route path="/subadmin/news" element={<SubAdminNews />} />
              <Route path="/subadmin/tasks" element={<SubAdminTasks />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
