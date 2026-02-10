import { useState, useContext, useEffect } from "react";
import { Copy, Check } from "lucide-react";
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
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    try {
      await apiService.stopMining();
      await loadMiningData();
      toast({ title: "Success!", description: "Tokens claimed successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim tokens",
        variant: "destructive"
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mining data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Profile */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/SocialPayX.png" alt="SocialPay X" className="w-[72px] h-[72px] rounded-full object-cover" />
        </div>
        
        {/* Profile Section - Top Right */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-800">{user?.username?.charAt(0)?.toUpperCase()}</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {user?.username}
          </p>
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

      {/* Stats Cards - Bottom */}
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
            <p className="text-xs text-muted-foreground mb-1">Total Mined</p>
            <p className="text-xl font-bold text-foreground">
              <span className="gradient-text">{miningData?.totalMined?.toFixed(4) || '0.0000'}</span>
              <span className="text-primary text-sm ml-1">SPX</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Mining Rate</p>
            <p className="text-lg font-bold text-foreground">
              {miningData?.miningRate || 0.1} <span className="text-primary text-xs">SPX/hr</span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Current Earnings</p>
            <p className="text-lg font-bold text-accent">{minedAmount.toFixed(5)} <span className="text-xs text-muted-foreground">SPX</span></p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => handleCopy(user?.referralCode || "39F8BC2A")}
          className="w-full mt-4 py-3 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center gap-2 text-primary font-medium hover:bg-primary/30 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? `Copied ${user?.referralCode}!` : `Copy Referral: ${user?.referralCode || '39F8BC2A'}`}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;