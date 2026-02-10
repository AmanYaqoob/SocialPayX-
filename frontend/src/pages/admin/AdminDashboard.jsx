import { useState, useEffect } from "react";
import { Users, Shield, Coins, Wallet, TrendingUp, Activity } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getAdminDashboard();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statsCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers || 0 },
    { icon: Activity, label: "Active Miners", value: stats?.activeMiners || 0 },
    { icon: Shield, label: "Pending KYC", value: stats?.pendingKYC || 0 },
    { icon: Shield, label: "Approved KYC", value: stats?.approvedKYC || 0 },
    { icon: Coins, label: "Total Mined", value: `${(stats?.totalMined || 0).toFixed(2)} SPX` },
    { icon: Wallet, label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0 },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform statistics and activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* System Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">System Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-green-500">{stats?.activeMiners || 0}</p>
              <p className="text-sm text-muted-foreground">Active Miners</p>
            </div>
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats?.approvedKYC || 0}</p>
              <p className="text-sm text-muted-foreground">Verified Users</p>
            </div>
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-accent">{(stats?.totalMined || 0).toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">Total SPX Mined</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
