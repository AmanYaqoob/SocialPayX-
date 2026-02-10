import { useState, useContext, useEffect } from "react";
import { Shield, Copy, Upload, CheckCircle, Clock, XCircle, Lock } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const KYC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [kycStatus, setKycStatus] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      loadData();
    }
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [settingsData, kycResponse] = await Promise.all([
        fetch('http://localhost:5001/api/admin/settings/public').then(r => r.json()),
        apiService.getKYCStatus()
      ]);
      setSettings(settingsData);
      setKycData(kycResponse);
      setKycStatus(kycResponse.kycStatus);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    toast({ title: "Copied!", description: "USDT address copied to clipboard" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid transaction ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitKYC(transactionId);
      setKycStatus("pending");
      toast({
        title: "Submitted!",
        description: "Your KYC verification is under review",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit KYC",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (settings && !settings.kycEnabled) {
      return {
        icon: Lock,
        color: "text-orange-500",
        bgColor: "bg-orange-500/20",
        text: "KYC Temporarily Unavailable",
        description: "KYC verification is currently disabled by the administrator. Please check back later or contact support for more information.",
      };
    }

    // Check if user has actually submitted KYC (has TID)
    const hasSubmitted = kycData?.kycTID && kycData.kycTID.trim() !== '';

    switch (kycStatus) {
      case "not_submitted":
        return {
          icon: Shield,
          color: "text-primary",
          bgColor: "bg-primary/20",
          text: "KYC Not Submitted",
          description: "Complete your KYC verification to unlock all platform features.",
        };
      case "pending":
        if (!hasSubmitted) {
          return {
            icon: Shield,
            color: "text-primary",
            bgColor: "bg-primary/20",
            text: "KYC Not Submitted",
            description: "Complete your KYC verification to unlock all platform features.",
          };
        }
        return {
          icon: Clock,
          color: "text-accent",
          bgColor: "bg-accent/20",
          text: "Pending Review",
          description: "Your KYC submission is being reviewed. This usually takes 24-48 hours.",
        };
      case "locked":
        return {
          icon: Lock,
          color: "text-orange-500",
          bgColor: "bg-orange-500/20",
          text: "KYC Temporarily Unavailable",
          description: "KYC verification is currently disabled by the administrator. Please check back later or contact support for more information.",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-accent",
          bgColor: "bg-accent/20",
          text: "Pending Review",
          description: "Your KYC submission is being reviewed. This usually takes 24-48 hours.",
        };
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/20",
          text: "Verified",
          description: "Your KYC has been approved. You now have full platform access.",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/20",
          text: "Rejected",
          description: "Your KYC was rejected. Please contact support for more information.",
        };
      default:
        return null;
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status?.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const usdtAddress = settings?.usdtWalletAddress || "Loading...";
  const requiredAmount = settings?.kycUsdtAmount || 10;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">KYC Verification</h1>
      </header>

      {/* Status Card */}
      <div className="px-4 mb-6">
        <div className={`${status?.bgColor} border border-border rounded-2xl p-6 text-center`}>
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${status?.bgColor} flex items-center justify-center`}>
              {StatusIcon && <StatusIcon className={`w-8 h-8 ${status?.color}`} />}
            </div>
            <div>
              <h3 className={`font-bold text-xl ${status?.color} mb-2`}>{status?.text}</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">{status?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Form - Only show if unlocked and not approved */}
      {settings?.kycEnabled && ((kycStatus === "not_submitted") || (kycStatus === "pending" && !kycData?.kycTID) || kycStatus === "rejected") && (
        <div className="px-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Complete KYC Verification</h3>
            </div>

            {/* Instructions */}
            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-foreground mb-3">Instructions:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Send exactly <span className="text-primary font-semibold">{requiredAmount} USDT</span> to the address below</li>
                <li>2. Use only <span className="text-accent font-semibold">TRC20</span> network</li>
                <li>3. Copy and paste your Transaction ID (TID) after payment</li>
                <li>4. Wait for admin approval (24-48 hours)</li>
              </ol>
            </div>

            {/* USDT Address */}
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">USDT Deposit Address (TRC20)</label>
              <div className="bg-input border border-border rounded-xl p-4 flex items-center justify-between">
                <p className="text-xs text-foreground font-mono truncate flex-1">{usdtAddress}</p>
                <button
                  onClick={copyAddress}
                  className="ml-2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Amount Display */}
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">Required Amount</label>
              <div className="bg-input border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground">{requiredAmount} <span className="text-primary">USDT</span></p>
              </div>
            </div>

            {/* Transaction ID Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">Transaction ID (TID)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none input-glow"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 btn-gradient rounded-xl font-semibold text-foreground btn-glow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}



      <BottomNav />
    </div>
  );
};

export default KYC;
