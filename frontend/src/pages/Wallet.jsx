import { useState, useContext, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Copy, Clock, CheckCircle, XCircle, Lock } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const Wallet = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      loadWalletData();
    }
  }, [isAuthenticated, navigate]);

  const loadWalletData = async () => {
    try {
      const [balanceData, withdrawalData, profileData] = await Promise.all([
        apiService.getWalletBalance(),
        apiService.getWithdrawals(),
        apiService.getProfile()
      ]);
      setBalance(balanceData.spxBalance || 0);
      setWithdrawals(withdrawalData.withdrawals || []);
      setKycStatus(profileData.kycStatus);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const transactions = [
    { id: 1, type: "deposit", amount: 50.0, status: "completed", date: "2024-01-15" },
    { id: 2, type: "mining", amount: 0.00532, status: "completed", date: "2024-01-14" },
    { id: 3, type: "referral", amount: 25.5, status: "completed", date: "2024-01-13" },
    { id: 4, type: "withdraw", amount: -20.0, status: "pending", date: "2024-01-12" },
    { id: 5, type: "mining", amount: 0.00421, status: "completed", date: "2024-01-11" },
  ];

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (kycStatus !== 'approved') {
      toast({
        title: "KYC Required",
        description: "Please complete KYC verification to withdraw",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(withdrawAmount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SPX to withdraw",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiService.requestWithdrawal(parseFloat(withdrawAmount), withdrawAddress);
      toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal request is pending approval",
      });
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
      loadWalletData(); // Reload data
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-accent" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Wallet</h1>
      </header>

      {/* Balance Card */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-secondary/20 to-primary/20 border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
          <p className="text-4xl font-bold text-foreground mb-1">
            <span className="gradient-text">{balance.toFixed(2)}</span>
            <span className="text-primary text-lg ml-2">SPX</span>
          </p>
          <p className="text-sm text-muted-foreground">≈ $0.00 USD</p>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            {kycStatus === 'approved' ? (
              <button
                onClick={() => setShowWithdraw(true)}
                className="w-full flex items-center justify-center gap-2 py-3 btn-gradient rounded-xl font-medium text-foreground btn-glow"
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            ) : (
              <button
                onClick={() => navigate('/kyc')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-muted border border-border rounded-xl font-medium text-muted-foreground"
              >
                <Lock className="w-4 h-4" />
                KYC Required
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Withdrawal History</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : withdrawals.length > 0 ? (
            withdrawals.map((withdrawal, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Withdrawal</p>
                    <p className="text-xs text-muted-foreground">{new Date(withdrawal.requestDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-destructive">-{withdrawal.amount.toFixed(5)} SPX</p>
                  </div>
                  {getStatusIcon(withdrawal.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No withdrawals yet</div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowWithdraw(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Withdraw SPX</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Available: {balance.toFixed(2)} SPX</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Wallet Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-3 bg-muted rounded-lg font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 btn-gradient rounded-lg font-medium text-foreground btn-glow"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Wallet;
