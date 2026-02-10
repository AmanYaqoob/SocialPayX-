import { useState, useEffect } from "react";
import { Save, Shield, Bell, Database, Globe, AlertTriangle, RefreshCw, UserCheck } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const AdminSettings = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    kycEnabled: true,
    miningEnabled: true,
    referralEnabled: true,
    withdrawalsEnabled: true,
    usdtWalletAddress: '',
    kycUsdtAmount: 10,
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    twoFactorRequired: false,
    apiRateLimit: 100,
    sessionTimeout: 30,
    backupFrequency: "daily",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading settings...');
      // Try both endpoints to see which one works
      const [adminSettings, publicSettings] = await Promise.all([
        apiService.getAdminSettings().catch(e => ({ error: e.message })),
        apiService.getSettings().catch(e => ({ error: e.message }))
      ]);
      
      console.log('Admin settings:', adminSettings);
      console.log('Public settings:', publicSettings);
      
      // Use admin settings if available, otherwise fall back to public
      const data = adminSettings.error ? publicSettings : adminSettings;
      
      if (!data.error) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Settings load error:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [activityLogs] = useState([
    { id: 1, action: "User Registration", details: "New user mike_brown registered", timestamp: "2024-01-28 15:45:00", ip: "192.168.1.1" },
    { id: 2, action: "KYC Approved", details: "KYC approved for sarah_jones", timestamp: "2024-01-28 15:30:00", ip: "192.168.1.2" },
    { id: 3, action: "Withdrawal Processed", details: "1000 SPX withdrawal for bob_wilson", timestamp: "2024-01-28 15:15:00", ip: "192.168.1.2" },
    { id: 4, action: "Settings Updated", details: "Mining rate updated to 0.00002", timestamp: "2024-01-28 14:45:00", ip: "192.168.1.2" },
    { id: 5, action: "User Suspended", details: "User john_doe suspended for violation", timestamp: "2024-01-28 14:30:00", ip: "192.168.1.2" },
  ]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      console.log('Saving settings:', settings);
      const response = await apiService.updateSettings(settings);
      console.log('Settings saved:', response);
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
      });
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const toggleMaintenance = () => {
    const newState = !settings.maintenanceMode;
    handleChange("maintenanceMode", newState);
    toast({
      title: newState ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
      description: newState ? "Platform is now in maintenance mode" : "Platform is now live",
      variant: newState ? "destructive" : "default",
    });
  };

  const triggerBackup = () => {
    toast({
      title: "Backup Started",
      description: "Database backup is in progress...",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground">Configure platform settings and view logs</p>
          </div>
          <button
            onClick={saveSettings}
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg font-medium text-foreground btn-glow"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Maintenance Banner */}
        {settings.maintenanceMode && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Maintenance Mode Active</p>
              <p className="text-sm text-muted-foreground">Platform is currently unavailable to users</p>
            </div>
            <button
              onClick={toggleMaintenance}
              className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
            >
              Go Live
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* KYC Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">KYC Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">KYC Status</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.kycEnabled ? "KYC submissions are enabled" : "KYC submissions are locked"}
                  </p>
                </div>
                <button
                  onClick={() => handleChange("kycEnabled", !settings.kycEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.kycEnabled ? "bg-green-500" : "bg-destructive"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.kycEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Required USDT Amount</label>
                <input
                  type="number"
                  value={settings.kycUsdtAmount || 10}
                  onChange={(e) => handleChange("kycUsdtAmount", parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">USDT Wallet Address</label>
                <input
                  type="text"
                  value={settings.usdtWalletAddress || 'TRx7NvKMc8NLLd5YXg6VPzYkF7p5PUv9bZ'}
                  onChange={(e) => handleChange("usdtWalletAddress", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
              </div>
            </div>
          </div>

          {/* Platform Features */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Platform Features</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">KYC Verification</p>
                  <p className="text-xs text-muted-foreground">Enable KYC requirement</p>
                </div>
                <button
                  onClick={() => handleChange("kycEnabled", !settings.kycEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.kycEnabled ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.kycEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">USDT Wallet Address (TRC20)</label>
                <input
                  type="text"
                  value={settings.usdtWalletAddress}
                  onChange={(e) => handleChange("usdtWalletAddress", e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                  placeholder="TRC20 wallet address"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">KYC USDT Amount</label>
                <input
                  type="number"
                  value={settings.kycUsdtAmount}
                  onChange={(e) => handleChange("kycUsdtAmount", parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                  placeholder="10"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Mining System</p>
                  <p className="text-xs text-muted-foreground">Enable mining functionality</p>
                </div>
                <button
                  onClick={() => handleChange("miningEnabled", !settings.miningEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.miningEnabled ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.miningEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Referral System</p>
                  <p className="text-xs text-muted-foreground">Enable referral rewards</p>
                </div>
                <button
                  onClick={() => handleChange("referralEnabled", !settings.referralEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.referralEnabled ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.referralEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Withdrawals</p>
                  <p className="text-xs text-muted-foreground">Enable withdrawal requests</p>
                </div>
                <button
                  onClick={() => handleChange("withdrawalsEnabled", !settings.withdrawalsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.withdrawalsEnabled ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.withdrawalsEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Disable platform access</p>
                </div>
                <button
                  onClick={toggleMaintenance}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.maintenanceMode ? "bg-destructive" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">User Registration</p>
                  <p className="text-xs text-muted-foreground">Allow new signups</p>
                </div>
                <button
                  onClick={() => handleChange("registrationEnabled", !settings.registrationEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.registrationEnabled ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.registrationEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">2FA Required</p>
                  <p className="text-xs text-muted-foreground">Force 2FA for all users</p>
                </div>
                <button
                  onClick={() => handleChange("twoFactorRequired", !settings.twoFactorRequired)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.twoFactorRequired ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.twoFactorRequired ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">API Rate Limit (requests/min)</label>
                <input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleChange("apiRateLimit", parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Send email alerts</p>
                </div>
                <button
                  onClick={() => handleChange("emailNotifications", !settings.emailNotifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailNotifications ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                    settings.emailNotifications ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Database</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Backup Frequency</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange("backupFrequency", e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <button
                onClick={triggerBackup}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Trigger Manual Backup
              </button>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-card border border-border rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Details</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">IP Address</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{log.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{log.details}</span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{log.ip}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
