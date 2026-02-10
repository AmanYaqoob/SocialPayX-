import { useState } from "react";
import { Power, Coins, Clock, TrendingUp, Save } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";

const AdminMining = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    miningEnabled: true,
    miningRate: 0.00001,
    minClaimAmount: 0.001,
    maxDailyMining: 1.0,
    referralBonus: 0.1,
    teamBonus: 0.05,
  });

  const [stats] = useState({
    totalMiners: 8234,
    activeNow: 1256,
    totalMined: 2534892.45,
    avgSessionTime: "4.5 hours",
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleMining = () => {
    const newState = !settings.miningEnabled;
    handleChange("miningEnabled", newState);
    toast({
      title: newState ? "Mining Enabled" : "Mining Disabled",
      description: newState ? "Users can now mine SPX" : "Mining has been disabled globally",
    });
  };

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Mining settings have been updated successfully",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mining Settings</h1>
            <p className="text-muted-foreground">Configure mining rates and limits</p>
          </div>
          <button
            onClick={saveSettings}
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg font-medium text-foreground btn-glow"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Mining Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Miners</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalMiners.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Power className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Active Now</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.activeNow.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Total Mined</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalMined.toLocaleString()} SPX</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Avg Session</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.avgSessionTime}</p>
          </div>
        </div>

        {/* Mining Toggle */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                settings.miningEnabled ? "bg-green-500/20" : "bg-destructive/20"
              }`}>
                <Power className={`w-6 h-6 ${settings.miningEnabled ? "text-green-500" : "text-destructive"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Global Mining Status</h3>
                <p className="text-sm text-muted-foreground">
                  {settings.miningEnabled ? "Mining is currently active for all users" : "Mining is disabled globally"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleMining}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                settings.miningEnabled
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                  : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
              }`}
            >
              {settings.miningEnabled ? "Disable Mining" : "Enable Mining"}
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mining Rate Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Rate Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Mining Rate (SPX per second)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={settings.miningRate}
                  onChange={(e) => handleChange("miningRate", parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {(settings.miningRate * 3600).toFixed(4)} SPX/hour
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Referral Bonus (% of referee's mining)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.referralBonus * 100}
                  onChange={(e) => handleChange("referralBonus", parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Team Bonus (% per level)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.teamBonus * 100}
                  onChange={(e) => handleChange("teamBonus", parseFloat(e.target.value) / 100)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
              </div>
            </div>
          </div>

          {/* Limit Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Limit Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Minimum Claim Amount (SPX)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={settings.minClaimAmount}
                  onChange={(e) => handleChange("minClaimAmount", parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users must mine at least this amount before claiming
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Max Daily Mining Limit (SPX)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.maxDailyMining}
                  onChange={(e) => handleChange("maxDailyMining", parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum SPX a user can mine per day (0 = unlimited)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Calculator */}
        <div className="bg-card border border-border rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-foreground mb-4">Earnings Calculator</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold gradient-text">{(settings.miningRate * 60).toFixed(5)}</p>
              <p className="text-xs text-muted-foreground">SPX/minute</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold gradient-text">{(settings.miningRate * 3600).toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">SPX/hour</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold gradient-text">{(settings.miningRate * 86400).toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">SPX/day</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold gradient-text">{(settings.miningRate * 2592000).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">SPX/month</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMining;
