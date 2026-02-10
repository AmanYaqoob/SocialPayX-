import { useState, useEffect } from "react";
import { Search, Check, X, Eye, ExternalLink, Copy } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const AdminKYC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await apiService.getKYCSubmissions('all');
      setSubmissions(data.submissions || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load KYC submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.kycTID?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (userId) => {
    try {
      await apiService.reviewKYC(userId, 'approved');
      toast({ title: "KYC Approved", description: "KYC has been approved" });
      loadSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve KYC",
        variant: "destructive"
      });
    }
    setSelectedSubmission(null);
  };

  const handleReject = async (userId, reason) => {
    try {
      await apiService.reviewKYC(userId, 'rejected', reason);
      toast({ title: "KYC Rejected", description: "KYC has been rejected" });
      loadSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject KYC",
        variant: "destructive"
      });
    }
    setSelectedSubmission(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Copied to clipboard" });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">KYC Management</h1>
            <p className="text-muted-foreground">Review and manage KYC submissions</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user or TID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow w-full md:w-64"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-accent">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Submitted</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                      Loading submissions...
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                      No KYC submissions found
                    </td>
                  </tr>
                ) : filteredSubmissions.map((sub) => (
                  <tr key={sub._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{sub.username}</p>
                        <p className="text-xs text-muted-foreground">{sub.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-mono">
                          {sub.kycTID?.slice(0, 12)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(sub.kycTID)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-foreground">10 USDT</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sub.kycStatus === "approved" 
                          ? "bg-green-500/20 text-green-500" 
                          : sub.kycStatus === "pending"
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {sub.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-muted-foreground text-sm">{new Date(sub.kycSubmissionDate).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      {sub.kycStatus === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(sub._id)}
                            className="p-2 hover:bg-green-500/10 rounded-lg text-green-500 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://tronscan.org/#/transaction/${sub.kycTID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            title="View on Blockchain"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejection Modal */}
        {selectedSubmission && selectedSubmission.kycStatus === "pending" && (
          <RejectModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onReject={(reason) => handleReject(selectedSubmission._id, reason)}
          />
        )}

        {/* Details Modal */}
        {selectedSubmission && selectedSubmission.kycStatus !== "pending" && (
          <DetailsModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const RejectModal = ({ submission, onClose, onReject }) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Reject KYC Submission</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Rejecting KYC for: <span className="text-primary">{submission.username}</span>
        </p>
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">Rejection Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={3}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-muted rounded-lg font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onReject(reason)}
            className="flex-1 py-3 bg-destructive rounded-lg font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ submission, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">KYC Details</h3>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User:</span>
            <span className="text-foreground">{submission.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={submission.kycStatus === "approved" ? "text-green-500" : "text-destructive"}>
              {submission.kycStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="text-foreground">10 USDT</span>
          </div>
          {submission.kycRejectionReason && (
            <div>
              <span className="text-muted-foreground block mb-1">Rejection Reason:</span>
              <span className="text-destructive text-sm">{submission.kycRejectionReason}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-muted rounded-lg font-medium text-foreground hover:bg-muted/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminKYC;
