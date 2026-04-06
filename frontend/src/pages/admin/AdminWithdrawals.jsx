import { useState, useEffect } from "react";
import { Search, Check, X, Clock, AlertTriangle, Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const SPX_PRICE = 0.20;

const StatusBadge = ({ status }) => {
  const map = {
    pending:  "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${map[status] || map.pending}`}>
      {status === "pending" && <Clock className="w-3 h-3" />}
      {status}
    </span>
  );
};

// ── Withdrawals Tab ───────────────────────────────────────────────────────────

const WithdrawalsTab = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus]   = useState("pending");
  const [searchQuery, setSearchQuery]     = useState("");
  const [withdrawals, setWithdrawals]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(null);

  useEffect(() => { load(); }, [filterStatus]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWithdrawalRequests(filterStatus === "all" ? undefined : filterStatus);
      setWithdrawals(data.withdrawals || []);
    } catch {
      toast({ title: "Error", description: "Failed to load withdrawals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (userId, id, status) => {
    try {
      await apiService.processWithdrawal(userId, id, status);
      toast({ title: status === "approved" ? "Approved ✅" : "Rejected", description: `Withdrawal has been ${status}.` });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    toast({ title: "Copied!" });
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filtered = withdrawals.filter(w =>
    (w.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     w.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     w.address?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === "all" || w.status === filterStatus)
  );

  const pendingCount = withdrawals.filter(w => w.status === "pending").length;
  const pendingTotal = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + w.amount, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none w-52"
            />
          </div>
        </div>
      </div>

      {/* Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="font-medium text-foreground">{pendingCount} pending withdrawal{pendingCount > 1 ? "s" : ""}</p>
            <p className="text-sm text-muted-foreground">Total: {pendingTotal.toFixed(2)} SPX ≈ ${(pendingTotal * SPX_PRICE).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Wallet Address</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No withdrawals found</td></tr>
              ) : (
                filtered.map(w => (
                  <tr key={w._id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{w.username}</p>
                      <p className="text-xs text-muted-foreground">{w.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{w.amount.toFixed(2)} SPX</p>
                      <p className="text-xs text-muted-foreground">≈ ${(w.amount * SPX_PRICE).toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-mono max-w-[160px] truncate block">
                          {w.address}
                        </code>
                        <button onClick={() => copyAddress(w.address)} className="p-1 hover:bg-primary/10 rounded text-primary">
                          {copiedAddress === w.address ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={w.status} /></td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(w.requestDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {w.status === "pending" ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleProcess(w.userId, w._id, "approved")} className="p-2 hover:bg-green-500/10 rounded-lg text-green-400" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleProcess(w.userId, w._id, "rejected")} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Deposits Tab ──────────────────────────────────────────────────────────────

const DepositsTab = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery]   = useState("");
  const [deposits, setDeposits]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [copied, setCopied]             = useState(null);

  useEffect(() => { load(); }, [filterStatus]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDepositRequests(filterStatus === "all" ? undefined : filterStatus);
      setDeposits(data.deposits || []);
    } catch {
      toast({ title: "Error", description: "Failed to load deposits", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (userId, id, status) => {
    try {
      await apiService.processDeposit(userId, id, status);
      toast({ title: status === "approved" ? "Deposit Approved ✅" : "Deposit Rejected", description: status === "approved" ? "SPX credited to user balance." : "Deposit request rejected." });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyTxid = (txid) => {
    navigator.clipboard.writeText(txid);
    setCopied(txid);
    toast({ title: "TXID Copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = deposits.filter(d =>
    (d.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     d.txid?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === "all" || d.status === filterStatus)
  );

  const pendingCount = deposits.filter(d => d.status === "pending").length;
  const pendingTotal = deposits.filter(d => d.status === "pending").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search user or TXID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none w-52"
          />
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-green-400" />
          <div>
            <p className="font-medium text-foreground">{pendingCount} pending deposit{pendingCount > 1 ? "s" : ""} to verify</p>
            <p className="text-sm text-muted-foreground">Total: {pendingTotal.toFixed(2)} SPX ≈ ${(pendingTotal * SPX_PRICE).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No deposits found</td></tr>
              ) : (
                filtered.map(d => (
                  <tr key={d._id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{d.username}</p>
                      <p className="text-xs text-muted-foreground">{d.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-green-400">+{d.amount.toFixed(2)} SPX</p>
                      <p className="text-xs text-muted-foreground">≈ ${(d.amount * SPX_PRICE).toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-mono max-w-[160px] truncate block">
                          {d.txid}
                        </code>
                        <button onClick={() => copyTxid(d.txid)} className="p-1 hover:bg-primary/10 rounded text-primary">
                          {copied === d.txid ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(d.requestDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {d.status === "pending" ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleProcess(d.userId, d._id, "approved")} className="p-2 hover:bg-green-500/10 rounded-lg text-green-400" title="Approve & Credit SPX">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleProcess(d.userId, d._id, "rejected")} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const AdminWithdrawals = () => {
  const [activeTab, setActiveTab] = useState("withdrawals");

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Deposits & Withdrawals</h1>
          <p className="text-muted-foreground">Review and process user fund requests</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-card border border-border rounded-xl p-1 gap-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "withdrawals" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Withdrawals
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "deposits" ? "bg-green-500 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposits
          </button>
        </div>

        {activeTab === "withdrawals" ? <WithdrawalsTab /> : <DepositsTab />}
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
