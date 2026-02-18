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

      {/* Social Media Section */}
      <div className="px-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Join Our Community</p>
          <div className="grid grid-cols-2 gap-3">

            {/* X (Twitter) */}
            <a
              href="https://x.com/SocialPayX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-white/30 hover:bg-white/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">X (Twitter)</p>
                <p className="text-xs text-muted-foreground truncate">@SocialPayX</p>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61587974789291"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">Facebook</p>
                <p className="text-xs text-muted-foreground truncate">SocialPayX</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/socialpayx?igsh=bzIyZGNqYjZ6NWVn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)"}}>
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">Instagram</p>
                <p className="text-xs text-muted-foreground truncate">@socialpayx</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029Vb6urAcG3R3f1xgOCS3i"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">WhatsApp</p>
                <p className="text-xs text-muted-foreground truncate">Official Channel</p>
              </div>
            </a>

          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;