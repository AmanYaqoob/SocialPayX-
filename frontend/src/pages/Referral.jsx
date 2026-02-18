import { useState, useContext, useEffect } from "react";
import { Copy, Share2, Users, Trophy, ChevronRight } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const Referral = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("referrals");
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      loadReferralData();
    }
  }, [isAuthenticated, navigate]);

  const loadReferralData = async () => {
    try {
      const data = await apiService.getReferralInfo();
      setReferralData(data);
    } catch (error) {
      console.error('Failed to load referral data:', error);
      // Set default data if API fails
      setReferralData({
        referralCount: 0,
        referralEarnings: 0,
        referredUsers: []
      });
    } finally {
      setLoading(false);
    }
  };

  const referralCode = user?.referralCode || "Loading...";
  const totalReferrals = referralData?.referralCount || 0;
  const maxReferrals = 1615;
  const earnedFromReferrals = referralData?.referralEarnings || 0;

  const myReferrals = referralData?.referredUsers || [];

  const topMiners = [
    { name: "Alamin Hossain", amount: 104, currency: "SPX", rank: 1 },
    { name: "Alex Smith", amount: 104, currency: "SPX", rank: 2 },
    { name: "John Doe", amount: 98, currency: "SPX", rank: 3 },
  ];

  const copyCode = () => {
    const codeToShare = user?.referralCode || '39F8BC2A';
    navigator.clipboard.writeText(codeToShare);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
  };

  const shareReferral = () => {
    const codeToShare = user?.referralCode || '39F8BC2A';
    if (navigator.share) {
      navigator.share({
        title: "Join SPX Mining",
        text: `Join SPX Mining with my referral code: ${codeToShare}`,
        url: `https://socialpayx.com/ref/${codeToShare}`,
      });
    } else {
      copyCode();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Stake</h1>
      </header>

      {/* Invite Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-secondary/20 to-primary/20 border border-border rounded-2xl p-6 text-center">
          {/* Avatar/Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center glow-primary">
            <Users className="w-8 h-8 text-foreground" />
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">
            Invited Friends & Get Rewards
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Earn up to 1000X by referring others
          </p>

          {/* Referral Code */}
          <div className="bg-card/50 border border-border rounded-xl p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-primary">🏆 {user?.referralCode || '39F8BC2A'}</span>
              <button onClick={copyCode} className="p-1 text-primary hover:bg-primary/10 rounded">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-card/50 border border-border rounded-xl p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-2">Your Referral Link</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-primary truncate">https://socialpayx.com/ref/{user?.referralCode || '39F8BC2A'}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(`https://socialpayx.com/ref/${user?.referralCode || '39F8BC2A'}`);
                toast({ title: "Copied!", description: "Referral link copied to clipboard" });
              }} className="p-1 text-primary hover:bg-primary/10 rounded">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card/50 border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">{totalReferrals}/{maxReferrals}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-4">
              <p className="text-2xl font-bold gradient-text">{earnedFromReferrals.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">SPX Earned</p>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={shareReferral}
            className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share Friends
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "referrals"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Referrals
          </button>
          <button
            onClick={() => setActiveTab("top")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "top"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Top Miner
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4">
        {activeTab === "referrals" ? (
          <div className="space-y-3">
            {myReferrals.length > 0 ? (
              myReferrals.map((referral, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">
                        {referral.username?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{referral.username}</p>
                      <p className="text-xs text-muted-foreground">SPX</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-semibold">+{referral.totalMined?.toFixed(2) || '0.00'}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No referrals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your code to start earning
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {topMiners.map((miner, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    miner.rank === 1 
                      ? "bg-accent/20" 
                      : miner.rank === 2 
                      ? "bg-gray-400/20" 
                      : "bg-orange-600/20"
                  }`}>
                    <Trophy className={`w-5 h-5 ${
                      miner.rank === 1 
                        ? "text-accent" 
                        : miner.rank === 2 
                        ? "text-gray-400" 
                        : "text-orange-600"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{miner.name}</p>
                    <p className="text-xs text-muted-foreground">{miner.currency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold">+{miner.amount}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Referral;
