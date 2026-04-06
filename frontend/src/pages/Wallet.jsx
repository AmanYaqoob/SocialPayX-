import { useState, useContext, useEffect } from "react";
import {
  ArrowUpRight, ArrowDownLeft, Copy, Clock, CheckCircle, XCircle,
  Lock, TrendingUp, Coins, ChevronDown, ChevronUp, Loader2,
  AlertCircle, ExternalLink,
} from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SPX_PRICE = 0.20; // fallback — overridden by server

function usd(spx, price = SPX_PRICE) {
  return (spx * price).toFixed(2);
}

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" />,        label: "Pending" },
    approved: { cls: "bg-green-500/20 text-green-400",   icon: <CheckCircle className="w-3 h-3" />,  label: "Approved" },
    rejected: { cls: "bg-red-500/20 text-red-400",       icon: <XCircle className="w-3 h-3" />,      label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── Lock Overlay ──────────────────────────────────────────────────────────────

const LockedSection = ({ title, icon: Icon }) => (
  <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-6">
    <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 flex flex-col items-center justify-center z-10 rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center mb-3">
        <Lock className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{title} Locked</p>
      <p className="text-xs text-muted-foreground mt-1 text-center px-4">
        This feature is currently disabled. Contact admin to enable it.
      </p>
    </div>
    {/* Ghost content behind blur */}
    <div className="opacity-20 space-y-3 pointer-events-none select-none">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <div className="h-10 bg-muted rounded-xl" />
      <div className="h-10 bg-muted rounded-xl" />
      <div className="h-10 bg-primary rounded-xl" />
    </div>
  </div>
);

// ── Withdraw Modal ────────────────────────────────────────────────────────────

const WithdrawModal = ({ balance, spxPrice, minAmount, onClose, onSuccess }) => {
  const [amount, setAmount]   = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy]       = useState(false);
  const { toast }             = useToast();

  const usdVal = amount ? usd(parseFloat(amount) || 0, spxPrice) : "0.00";

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (num < minAmount) return toast({ title: `Minimum ${minAmount} SPX`, variant: "destructive" });
    if (num > balance) return toast({ title: "Insufficient balance", variant: "destructive" });
    if (!address.trim()) return toast({ title: "Enter wallet address", variant: "destructive" });

    setBusy(true);
    try {
      await apiService.requestWithdrawal(num, address.trim());
      toast({ title: "Withdrawal submitted ✅", description: "Pending admin approval." });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-primary" /> Withdraw SPX
        </h3>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2 text-sm text-primary">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Available: <span className="font-bold">{balance.toFixed(2)} SPX</span>
          <span className="text-muted-foreground ml-auto">≈ ${usd(balance, spxPrice)}</span>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Amount (SPX)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Min ${minAmount} SPX`}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => setAmount(balance.toFixed(2))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
            >
              MAX
            </button>
          </div>
          {amount && (
            <p className="text-xs text-muted-foreground mt-1">≈ ${usdVal} USD</p>
          )}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Wallet Address (TRC20/BEP20)</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Paste your wallet address"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 bg-muted rounded-xl font-medium text-muted-foreground hover:bg-muted/80">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="flex-1 py-3 btn-gradient rounded-xl font-semibold text-foreground btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Deposit Modal ─────────────────────────────────────────────────────────────

const DepositModal = ({ spxPrice, depositAddress, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [txid, setTxid]     = useState("");
  const [busy, setBusy]     = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast }           = useToast();

  const usdVal = amount ? usd(parseFloat(amount) || 0, spxPrice) : "0.00";

  const copyAddress = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    toast({ title: "Address copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (!txid.trim()) return toast({ title: "Enter transaction ID", variant: "destructive" });

    setBusy(true);
    try {
      await apiService.requestDeposit(num, txid.trim());
      toast({ title: "Deposit submitted ✅", description: "Awaiting admin confirmation." });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowDownLeft className="w-5 h-5 text-green-400" /> Deposit SPX
        </h3>

        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Send SPX to this address</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg flex-1 break-all font-mono">
              {depositAddress || "Contact admin for deposit address"}
            </code>
            {depositAddress && (
              <button onClick={copyAddress} className="p-2 bg-primary/10 rounded-lg text-primary hover:bg-primary/20">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Only send SPX. Other coins will be lost.
          </p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Amount (SPX)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="How much SPX are you depositing?"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          {amount && <p className="text-xs text-muted-foreground mt-1">≈ ${usdVal} USD</p>}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Transaction ID (TXID)</label>
          <input
            type="text"
            value={txid}
            onChange={e => setTxid(e.target.value)}
            placeholder="Paste your transaction hash"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">Found in your wallet or blockchain explorer after sending.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 bg-muted rounded-xl font-medium text-muted-foreground hover:bg-muted/80">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="flex-1 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-500/30 disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Wallet ───────────────────────────────────────────────────────────────

const Wallet = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [walletData, setWalletData]   = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits]       = useState([]);
  const [kycStatus, setKycStatus]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit]   = useState(false);
  const [historyTab, setHistoryTab]     = useState("withdrawals"); // "withdrawals" | "deposits"

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
    else loadAll();
  }, [isAuthenticated]);

  const loadAll = async () => {
    try {
      const [bal, wdl, dep, profile] = await Promise.all([
        apiService.getWalletBalance(),
        apiService.getWithdrawals(),
        apiService.getDeposits().catch(() => ({ deposits: [] })),
        apiService.getProfile(),
      ]);
      setWalletData(bal);
      setWithdrawals(wdl.withdrawals || []);
      setDeposits(dep.deposits || []);
      setKycStatus(profile.kycStatus);
    } catch (err) {
      toast({ title: "Failed to load wallet", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const spxPrice     = walletData?.spxPrice          ?? SPX_PRICE;
  const balance      = walletData?.spxBalance        ?? 0;
  const totalMined   = walletData?.totalMined        ?? 0;
  const refEarnings  = walletData?.referralEarnings  ?? 0;
  const withdrawOk   = walletData?.withdrawalsEnabled ?? false;
  const depositOk    = walletData?.depositsEnabled    ?? false;
  const depositAddr  = walletData?.depositAddress     ?? "";
  const minWithdraw  = walletData?.minWithdrawalAmount ?? 10;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Wallet</h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          1 SPX = ${spxPrice.toFixed(2)}
        </span>
      </header>

      <div className="px-4 space-y-4">

        {/* ── Main Balance Card ── */}
        <div className="bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <div className="flex items-end gap-3 mb-1">
            <p className="text-4xl font-bold gradient-text">{balance.toFixed(2)}</p>
            <p className="text-primary text-lg mb-1">SPX</p>
          </div>
          <p className="text-sm text-muted-foreground">≈ ${usd(balance, spxPrice)} USD</p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {/* Deposit */}
            {depositOk ? (
              <button
                onClick={() => setShowDeposit(true)}
                className="flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-semibold hover:bg-green-500/30 transition-all"
              >
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 bg-muted/50 border border-border rounded-xl text-muted-foreground text-sm cursor-not-allowed">
                <Lock className="w-4 h-4" /> Deposit
              </div>
            )}

            {/* Withdraw */}
            {withdrawOk && kycStatus === "approved" ? (
              <button
                onClick={() => setShowWithdraw(true)}
                className="flex items-center justify-center gap-2 py-3 btn-gradient rounded-xl font-semibold text-foreground btn-glow transition-all"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
            ) : withdrawOk && kycStatus !== "approved" ? (
              <button
                onClick={() => navigate("/kyc")}
                className="flex items-center justify-center gap-2 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl font-semibold hover:bg-yellow-500/30 transition-all"
              >
                <AlertCircle className="w-4 h-4" /> KYC Required
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 bg-muted/50 border border-border rounded-xl text-muted-foreground text-sm cursor-not-allowed">
                <Lock className="w-4 h-4" /> Withdraw
              </div>
            )}
          </div>
        </div>

        {/* ── SPX Coin Section ── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">S</span>
            </div>
            <div>
              <p className="font-bold text-foreground">SPX Coin</p>
              <p className="text-xs text-muted-foreground">SocialPayX Token</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-bold text-foreground">{balance.toFixed(4)}</p>
              <p className="text-xs text-green-400">+${usd(balance, spxPrice)}</p>
            </div>
          </div>

          {/* Stats row like an exchange */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="font-bold text-foreground text-sm">${spxPrice.toFixed(2)}</p>
              <p className="text-xs text-green-400">USD</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Mined</p>
              <p className="font-bold text-foreground text-sm">{totalMined.toFixed(2)}</p>
              <p className="text-xs text-primary">SPX</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Referrals</p>
              <p className="font-bold text-foreground text-sm">{refEarnings.toFixed(2)}</p>
              <p className="text-xs text-purple-400">SPX</p>
            </div>
          </div>

          {/* Holdings value bar */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-muted-foreground">Portfolio Value</span>
              </div>
              <span className="font-bold text-green-400">${usd(balance, spxPrice)} USD</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Based on current SPX price</span>
              <span>{balance.toFixed(2)} SPX × ${spxPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div>
          {/* Tab switcher */}
          <div className="flex bg-card border border-border rounded-2xl p-1 gap-1 mb-3">
            {[
              { id: "withdrawals", label: "Withdrawals", count: withdrawals.length },
              { id: "deposits",    label: "Deposits",    count: deposits.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setHistoryTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  historyTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    historyTab === tab.id ? "bg-white/20" : "bg-muted"
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Withdrawals list */}
          {historyTab === "withdrawals" && (
            <div className="space-y-2">
              {withdrawals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-2xl">
                  <ArrowUpRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No withdrawals yet</p>
                </div>
              ) : (
                withdrawals.map((w, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Withdrawal</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{w.address}</p>
                        <p className="text-xs text-muted-foreground">{new Date(w.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-red-400">-{w.amount.toFixed(2)} SPX</p>
                      <p className="text-xs text-muted-foreground">≈ ${usd(w.amount, spxPrice)}</p>
                      <StatusBadge status={w.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Deposits list */}
          {historyTab === "deposits" && (
            <div className="space-y-2">
              {deposits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-2xl">
                  <ArrowDownLeft className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No deposits yet</p>
                </div>
              ) : (
                deposits.map((d, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Deposit</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{d.txid}</p>
                        <p className="text-xs text-muted-foreground">{new Date(d.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-green-400">+{d.amount.toFixed(2)} SPX</p>
                      <p className="text-xs text-muted-foreground">≈ ${usd(d.amount, spxPrice)}</p>
                      <StatusBadge status={d.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          spxPrice={spxPrice}
          minAmount={minWithdraw}
          onClose={() => setShowWithdraw(false)}
          onSuccess={loadAll}
        />
      )}
      {showDeposit && (
        <DepositModal
          spxPrice={spxPrice}
          depositAddress={depositAddr}
          onClose={() => setShowDeposit(false)}
          onSuccess={loadAll}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Wallet;
