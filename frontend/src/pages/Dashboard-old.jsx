import { useState, useContext, useEffect } from "react";
import { Copy, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import MiningCircle from "../components/MiningCircle.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const Dashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isMining, setIsMining] = useState(false);
  const [balance, setBalance] = useState(0);
  const [minedAmount, setMinedAmount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [miningData, setMiningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [hashRate, setHashRate] = useState(3.56);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  // Real-time mining updates with 24-hour limit
  useEffect(() => {
    let interval;
    if (isMining && miningData) {
      interval = setInterval(() => {
        const now = new Date();
        const startTime = new Date(miningData.miningStartTime);
        const duration = (now - startTime) / (1000 * 60 * 60); // hours
        
        // Stop mining after 24 hours
        if (duration >= 24) {
          handleClaim();
          return;
        }
        
        const earnings = duration * miningData.miningRate;
        setMinedAmount(earnings);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMining, miningData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Load mining data
  useEffect(() => {
    if (isAuthenticated) {
      loadMiningData();
    }
  }, [isAuthenticated]);

  const loadMiningData = async () => {
    try {
      const [miningStatus, walletBalance] = await Promise.all([
        apiService.getMiningStatus(),
        apiService.getWalletBalance()
      ]);
      
      setMiningData(miningStatus);
      setIsMining(miningStatus.isMining);
      setBalance(walletBalance.spxBalance);
      setMinedAmount(miningStatus.currentEarnings || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load mining data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    setBalance((prev) => prev + minedAmount);
    setMinedAmount(0);
    toast({ title: "Success!", description: "Tokens claimed successfully" });
  };

  const toggleMining = async () => {
    try {
      if (isMining) {
        await apiService.stopMining();
      } else {
        await apiService.startMining();
      }
      await loadMiningData();
      toast({
        title: isMining ? "Mining Stopped" : "Mining Started",
        description: isMining ? "Tokens claimed and mining stopped" : "24-hour mining cycle started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle mining",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiService.updateProfile({ username: newUsername });
      setEditingProfile(false);
      toast({ title: "Success", description: "Profile updated successfully" });
      
      // Update user in context
      const updatedUser = { ...user, username: newUsername };
      login(updatedUser, localStorage.getItem('token'));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const referralLink = `https://spxmining.com/ref/${user?.referralCode || "SPX123"}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center glow-primary">
            <span className="text-sm font-bold text-foreground">S</span>
          </div>
          <span className="font-semibold text-foreground">Mining</span>
        </div>
        
        {/* Profile Section - Top Right */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">KYC Status</p>
            <p className={`text-sm font-medium ${
              user?.kycStatus === 'approved' ? 'text-green-500' : 
              user?.kycStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {user?.kycStatus === 'approved' ? '✅ Verified' : 
               user?.kycStatus === 'pending' ? '⏳ Pending' : '❌ Required'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">{user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div>
              {editingProfile ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-1 py-0.5 bg-input border border-border rounded text-xs w-20"
                    placeholder={user?.username}
                  />
                  <button onClick={updateProfile} className="text-green-500 text-xs">✓</button>
                  <button onClick={() => setEditingProfile(false)} className="text-red-500 text-xs">✕</button>
                </div>
              ) : (
                <p className="text-sm font-medium text-foreground cursor-pointer hover:text-primary" onClick={() => { setEditingProfile(true); setNewUsername(user?.username || ''); }}>
                  {user?.username} ✏️
                </p>
              )}
              <p className="text-xs text-muted-foreground">ID: {user?.id?.slice(-6)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mining Circle - Top Center */}
      <div className="flex flex-col items-center justify-center py-8">
        <MiningCircle isMining={isMining} balance={minedAmount} onClaim={handleClaim} />
        
        {/* Mining Control Button */}
        <button
          onClick={toggleMining}
          className={`mt-8 px-12 py-4 rounded-xl font-semibold text-lg transition-all ${
            isMining
              ? "bg-destructive/20 border border-destructive text-destructive hover:bg-destructive/30"
              : "btn-gradient text-foreground btn-glow"
          }`}
        >
          {isMining ? "Stop Mining" : "Start Mining"}
        </button>

        {/* Claim Button */}
        {minedAmount > 0 && (
          <button
            onClick={handleClaim}
            className="mt-4 px-8 py-3 bg-accent/20 border border-accent text-accent rounded-xl font-medium hover:bg-accent/30 transition-colors"
          >
            Claim {minedAmount.toFixed(5)} SPX
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
            <p className="text-xl font-bold text-foreground">
              <span className="gradient-text">{balance.toFixed(2)}</span>
              <span className="text-primary text-sm ml-1">SPX</span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Referrer Status</p>
            <p className="text-xl font-bold text-foreground">
              🏆 <span>{referralCount}/1487</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">By Team</p>
            <p className="text-lg font-bold text-foreground">
              {teamEarnings.toFixed(4)} <span className="text-primary text-xs">SPX</span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hash Rate</p>
                <p className="text-lg font-bold text-accent">{hashRate.toFixed(2)} <span className="text-xs text-muted-foreground">H/MN</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Earned by Mining</p>
                <p className="text-lg font-bold text-foreground">{(minedAmount * 30.38).toFixed(5)} <span className="text-primary text-xs">SPX</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => handleCopy(user?.referralCode || "SPX123")}
          className="w-full mt-4 py-3 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center gap-2 text-primary font-medium hover:bg-primary/30 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Mining Circle */}
      <div className="flex flex-col items-center justify-center py-8">
        <MiningCircle isMining={isMining} balance={minedAmount} onClaim={handleClaim} />
        
        {/* Mining Control Button */}
        <button
          onClick={toggleMining}
          className={`mt-8 px-12 py-4 rounded-xl font-semibold text-lg transition-all ${
            isMining
              ? "bg-destructive/20 border border-destructive text-destructive hover:bg-destructive/30"
              : "btn-gradient text-foreground btn-glow"
          }`}
        >
          {isMining ? "Stop Mining" : "Start Mining"}
        </button>

        {/* Claim Button */}
        {minedAmount > 0 && (
          <button
            onClick={handleClaim}
            className="mt-4 px-8 py-3 bg-accent/20 border border-accent text-accent rounded-xl font-medium hover:bg-accent/30 transition-colors"
          >
            Claim {minedAmount.toFixed(5)} SPX
          </button>
        )}
      </div>

      {/* Referral Link Section */}
      <div className="px-4 mt-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground truncate flex-1">{referralLink}</p>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => handleCopy(referralLink)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-accent text-sm">IMPORTANT!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Our official website is: <span className="text-primary">www.spxmining.com</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ensure you download the app only from our official Website or Google Play
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
