import { useState, useContext, useEffect } from "react";
import {
  ArrowUpRight, ArrowDownLeft, Copy, Clock, CheckCircle, XCircle,
  Lock, TrendingUp, Loader2, AlertCircle, Pickaxe,
} from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const TOKEN_PRICE = 0.01;   // 100 tokens = $1
const SPX_PRICE   = 0.20;   // 25 SPX = $5

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function toUsd(amount, price) {
  return (safeNum(amount) * safeNum(price)).toFixed(2);
}

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" />,       label: "Pending"  },
    approved: { cls: "bg-green-500/20 text-green-400",   icon: <CheckCircle className="w-3 h-3" />, label: "Approved" },
    rejected: { cls: "bg-red-500/20 text-red-400",       icon: <XCircle className="w-3 h-3" />,     label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── Lock Overlay ──────────────────────────────────────────────────────────────

const LockedBtn = ({ label, icon: Icon }) => (
  <div className="flex items-center justify-center gap-2 py-3 bg-muted/40 border border-border rounded-xl text-muted-foreground text-sm cursor-not-allowed select-none">
    <Lock className="w-4 h-4" /> {label}
  </div>
);

// ── Withdraw Modal ────────────────────────────────────────────────────────────

const WithdrawModal = ({ spxCoinBalance, spxPrice, minAmount, onClose, onSuccess }) => {
  const [amount, setAmount]   = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy]       = useState(false);
  const { toast }             = useToast();

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0)     return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (num < minAmount)      return toast({ title: `Minimum ${minAmount} SPX`, variant: "destructive" });
    if (num > spxCoinBalance) return toast({ title: "Insufficient SPX balance", variant: "destructive" });
    if (!address.trim())      return toast({ title: "Enter a wallet address", variant: "destructive" });

    setBusy(true);
    try {
      await apiService.requestWithdrawal(num, address.trim());
      toast({ title: "Withdrawal submitted ✅", description: "Pending admin approval." });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-primary" /> Withdraw SPX Coins
        </h3>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available SPX</span>
          <span className="font-bold text-foreground">{spxCoinBalance.toFixed(2)} SPX  <span className="text-muted-foreground font-normal">≈ ${toUsd(spxCoinBalance, spxPrice)}</span></span>
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
            <button onClick={() => setAmount(spxCoinBalance.toFixed(2))} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline">MAX</button>
          </div>
          {amount && <p className="text-xs text-muted-foreground mt-1">≈ ${toUsd(parseFloat(amount)||0, spxPrice)} USD</p>}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Paste your wallet address"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono text-sm"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 bg-muted rounded-xl font-medium text-muted-foreground">Cancel</button>
          <button onClick={handleSubmit} disabled={busy} className="flex-1 py-3 btn-gradient rounded-xl font-semibold text-foreground btn-glow flex items-center justify-center gap-2 disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
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

  const copyAddr = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    toast({ title: "Address copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (!txid.trim())     return toast({ title: "Enter your transaction ID", variant: "destructive" });

    setBusy(true);
    try {
      await apiService.requestDeposit(num, txid.trim());
      toast({ title: "Deposit submitted ✅", description: "Awaiting admin confirmation." });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowDownLeft className="w-5 h-5 text-green-400" /> Deposit SPX Coins
        </h3>

        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Send SPX to this address</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg flex-1 break-all font-mono">
              {depositAddress || "Contact admin for deposit address"}
            </code>
            {depositAddress && (
              <button onClick={copyAddr} className="p-2 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 shrink-0">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Only send SPX coins. Other assets will be lost.
          </p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Amount (SPX)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="How many SPX are you depositing?"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          {amount && <p className="text-xs text-muted-foreground mt-1">≈ ${toUsd(parseFloat(amount)||0, spxPrice)} USD</p>}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Transaction ID (TXID)</label>
          <input type="text" value={txid} onChange={e => setTxid(e.target.value)} placeholder="Paste transaction hash after sending"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono text-sm" />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 bg-muted rounded-xl font-medium text-muted-foreground">Cancel</button>
          <button onClick={handleSubmit} disabled={busy} className="flex-1 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-500/30 disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Wallet ───────────────────────────────────────────────────────────────

const Wallet = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [walletData, setWalletData]     = useState(null);
  const [withdrawals, setWithdrawals]   = useState([]);
  const [deposits, setDeposits]         = useState([]);
  const [kycStatus, setKycStatus]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit]   = useState(false);
  const [historyTab, setHistoryTab]     = useState("withdrawals");

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
    } catch {
      toast({ title: "Failed to load wallet", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tokenBalance     = safeNum(walletData?.tokenBalance);
  const spxCoinBalance   = safeNum(walletData?.spxCoinBalance);
  const referralEarnings = safeNum(walletData?.referralEarnings);
  const spxLegacy        = safeNum(walletData?.spxBalance);   // legacy spxBalance field
  const tokenPrice       = safeNum(walletData?.tokenPrice)  || TOKEN_PRICE;
  const spxPrice         = safeNum(walletData?.spxPrice)    || SPX_PRICE;
  const withdrawOk       = walletData?.withdrawalsEnabled ?? false;
  const depositOk        = walletData?.depositsEnabled    ?? false;
  const depositAddr      = walletData?.depositAddress     ?? "";
  const minWithdraw      = safeNum(walletData?.minWithdrawalAmount) || 10;

  // Sum all token sources for total portfolio value
  const totalUsd = (
    parseFloat(toUsd(tokenBalance,     tokenPrice)) +
    parseFloat(toUsd(spxCoinBalance,   spxPrice))   +
    parseFloat(toUsd(referralEarnings, tokenPrice)) +
    (spxLegacy > tokenBalance ? parseFloat(toUsd(spxLegacy - tokenBalance, tokenPrice)) : 0)
  );

  return (
    <div className="min-h-screen bg-background pb-24">

      <header className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Wallet</h1>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Total ≈ ${totalUsd.toFixed(2)} USD
        </span>
      </header>

      <div className="px-4 space-y-4">

        {/* ── Mining Tokens Card ── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center shrink-0">
              <Pickaxe className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">Mining Tokens</p>
              <p className="text-xs text-muted-foreground">Earned by mining · 100 tokens = $1</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-400">{tokenBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">≈ ${toUsd(tokenBalance, tokenPrice)} USD</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-semibold text-foreground text-sm">${tokenPrice.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Mined</p>
              <p className="font-semibold text-foreground text-sm">{safeNum(walletData?.totalMined).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">USD Value</p>
              <p className="font-semibold text-orange-400 text-sm">${toUsd(tokenBalance, tokenPrice)}</p>
            </div>
          </div>
        </div>

        {/* ── Referral Earnings Card ── */}
        {referralEarnings > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Referral Earnings</p>
                <p className="text-xs text-muted-foreground">Bonus tokens from referrals · same rate as mining</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{referralEarnings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">≈ ${toUsd(referralEarnings, tokenPrice)} USD</p>
              </div>
            </div>
          </div>
        )}

        {/* ── SPX Coin Card ── */}
        <div className="bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-primary">S</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">SPX Coin</p>
              <p className="text-xs text-muted-foreground">SocialPayX · 25 SPX = $5</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold gradient-text">{spxCoinBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">≈ ${toUsd(spxCoinBalance, spxPrice)} USD</p>
            </div>
          </div>

          {/* Exchange-style price row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-primary/20 text-center mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-semibold text-foreground text-sm">${spxPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">25 SPX =</p>
              <p className="font-semibold text-green-400 text-sm">$5.00</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Value</p>
              <p className="font-semibold text-primary text-sm">${toUsd(spxCoinBalance, spxPrice)}</p>
            </div>
          </div>

          {/* Deposit / Withdraw buttons */}
          <div className="grid grid-cols-2 gap-3">
            {depositOk ? (
              <button onClick={() => setShowDeposit(true)} className="flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-semibold hover:bg-green-500/30 transition-all text-sm">
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </button>
            ) : (
              <LockedBtn label="Deposit" icon={ArrowDownLeft} />
            )}

            {withdrawOk && kycStatus === "approved" ? (
              <button onClick={() => setShowWithdraw(true)} className="flex items-center justify-center gap-2 py-3 btn-gradient rounded-xl font-semibold text-foreground btn-glow transition-all text-sm">
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
            ) : withdrawOk && kycStatus !== "approved" ? (
              <button onClick={() => navigate("/kyc")} className="flex items-center justify-center gap-2 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl font-semibold text-sm hover:bg-yellow-500/30">
                <AlertCircle className="w-4 h-4" /> KYC Required
              </button>
            ) : (
              <LockedBtn label="Withdraw" icon={ArrowUpRight} />
            )}
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div>
          <div className="flex bg-card border border-border rounded-2xl p-1 gap-1 mb-3">
            {[
              { id: "withdrawals", label: "Withdrawals", count: withdrawals.length },
              { id: "deposits",    label: "Deposits",    count: deposits.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setHistoryTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  historyTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${historyTab === tab.id ? "bg-white/20" : "bg-muted"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Withdrawals */}
          {historyTab === "withdrawals" && (
            <div className="space-y-2">
              {withdrawals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-2xl">
                  <ArrowUpRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No withdrawals yet</p>
                </div>
              ) : withdrawals.map((w, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Withdrawal</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">{w.address}</p>
                      <p className="text-xs text-muted-foreground">{new Date(w.requestDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-red-400 text-sm">-{w.amount.toFixed(2)} SPX</p>
                    <p className="text-xs text-muted-foreground">≈ ${toUsd(w.amount, spxPrice)}</p>
                    <StatusBadge status={w.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Deposits */}
          {historyTab === "deposits" && (
            <div className="space-y-2">
              {deposits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-2xl">
                  <ArrowDownLeft className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No deposits yet</p>
                </div>
              ) : deposits.map((d, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Deposit</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">{d.txid}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.requestDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-green-400 text-sm">+{d.amount.toFixed(2)} SPX</p>
                    <p className="text-xs text-muted-foreground">≈ ${toUsd(d.amount, spxPrice)}</p>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal spxCoinBalance={spxCoinBalance} spxPrice={spxPrice} minAmount={minWithdraw}
          onClose={() => setShowWithdraw(false)} onSuccess={loadAll} />
      )}
      {showDeposit && (
        <DepositModal spxPrice={spxPrice} depositAddress={depositAddr}
          onClose={() => setShowDeposit(false)} onSuccess={loadAll} />
      )}

      <BottomNav />
    </div>
  );
};

export default Wallet;
