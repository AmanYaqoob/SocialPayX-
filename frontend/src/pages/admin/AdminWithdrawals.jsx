import { useState, useEffect } from "react";
import { Search, Check, X, Clock, AlertTriangle, Copy } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filterStatus]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWithdrawalRequests(filterStatus === "all" ? "pending" : filterStatus);
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingTotal = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);
  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = w.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (userId, withdrawalId) => {
    try {
      await apiService.processWithdrawal(userId, withdrawalId, "approved");
      toast({ 
        title: "Withdrawal Approved", 
        description: "Withdrawal has been approved successfully" 
      });
      loadWithdrawals();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve withdrawal",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (userId, withdrawalId) => {
    try {
      await apiService.processWithdrawal(userId, withdrawalId, "rejected");
      toast({ 
        title: "Withdrawal Rejected", 
        description: "Withdrawal request has been rejected",
        variant: "destructive"
      });
      loadWithdrawals();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject withdrawal",
        variant: "destructive"
      });
    }
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast({ title: "Copied!", description: "Address copied to clipboard" });
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Withdrawal Management</h1>
            <p className="text-muted-foreground">Process and manage withdrawal requests</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow w-48"
              />
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {pendingCount > 0 && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">
                {pendingCount} pending withdrawal{pendingCount > 1 ? "s" : ""} requiring attention
              </p>
              <p className="text-sm text-muted-foreground">Total value: {pendingTotal.toLocaleString()} SPX</p>
            </div>
          </div>
        )}

        {/* Withdrawals Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Address</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Requested</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{withdrawal.username}</p>
                        <p className="text-xs text-muted-foreground">{withdrawal.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{withdrawal.amount} SPX</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-mono">
                          {withdrawal.address}
                        </code>
                        <button
                          onClick={() => handleCopyAddress(withdrawal.address)}
                          className="p-1 hover:bg-primary/10 rounded text-primary transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress === withdrawal.address ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === "approved" 
                          ? "bg-green-500/20 text-green-500" 
                          : withdrawal.status === "pending"
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {withdrawal.status === "pending" && <Clock className="w-3 h-3" />}
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-muted-foreground text-sm">{new Date(withdrawal.requestDate).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      {withdrawal.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(withdrawal.userId, withdrawal._id)}
                            className="p-2 hover:bg-green-500/10 rounded-lg text-green-500 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.userId, withdrawal._id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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

export default AdminWithdrawals;
