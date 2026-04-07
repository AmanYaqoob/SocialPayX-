import { useState, useEffect } from "react";
import { Search, Edit, UserCheck, UserX, X, Save, Loader2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-5 first:mt-0 border-b border-border pb-1">
    {children}
  </p>
);

const Field = ({ label, value, onChange, type = "text", options, disabled }) => {
  if (options) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm text-foreground">{label}</span>
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSaved }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    isActive: user.isActive ?? true,
    isAdmin: user.isAdmin ?? false,
    isSubAdmin: user.isSubAdmin ?? false,
    isEmailVerified: user.isEmailVerified ?? false,
    kycStatus: user.kycStatus || "pending",
    kycRejectionReason: user.kycRejectionReason || "",
    spxBalance: user.spxBalance ?? 0,
    tokenBalance: user.tokenBalance ?? 0,
    spxCoinBalance: user.spxCoinBalance ?? 0,
    totalMined: user.totalMined ?? 0,
    miningRate: user.miningRate ?? 0.1,
    referralEarnings: user.referralEarnings ?? 0,
    followersCount: user.followers?.length ?? 0,
    followingCount: user.following?.length ?? 0,
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");
      toast({ title: "User Updated", description: `${form.username} saved successfully` });
      onSaved(data.user);
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-lg font-bold text-foreground">Edit User</h3>
            <p className="text-xs text-muted-foreground">ID: {user._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">

          <SectionTitle>Profile</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Username" value={form.username} onChange={set("username")} />
            <Field label="Email" value={form.email} onChange={set("email")} type="email" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <Field label="Active" value={form.isActive} onChange={set("isActive")} type="checkbox" />
            <Field label="Email Verified" value={form.isEmailVerified} onChange={set("isEmailVerified")} type="checkbox" />
            <Field label="Admin" value={form.isAdmin} onChange={set("isAdmin")} type="checkbox" />
            <Field label="Sub-Admin" value={form.isSubAdmin} onChange={set("isSubAdmin")} type="checkbox" />
          </div>

          <SectionTitle>KYC</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="KYC Status"
              value={form.kycStatus}
              onChange={set("kycStatus")}
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
            <Field
              label="Rejection Reason"
              value={form.kycRejectionReason}
              onChange={set("kycRejectionReason")}
              disabled={form.kycStatus !== "rejected"}
            />
          </div>

          <SectionTitle>Balances & Mining</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="SPX Balance" value={form.spxBalance} onChange={set("spxBalance")} type="number" />
            <Field label="Token Balance" value={form.tokenBalance} onChange={set("tokenBalance")} type="number" />
            <Field label="SPX Coin Balance" value={form.spxCoinBalance} onChange={set("spxCoinBalance")} type="number" />
            <Field label="Total Mined" value={form.totalMined} onChange={set("totalMined")} type="number" />
            <Field label="Mining Rate (tokens/hr)" value={form.miningRate} onChange={set("miningRate")} type="number" />
            <Field label="Referral Earnings" value={form.referralEarnings} onChange={set("referralEarnings")} type="number" />
          </div>

          <SectionTitle>Social</SectionTitle>
          <p className="text-xs text-muted-foreground mb-3">
            You can reduce follower/following counts by trimming the array. To increase, users must follow naturally.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={`Followers (current: ${user.followers?.length ?? 0})`}
              value={form.followersCount}
              onChange={set("followersCount")}
              type="number"
            />
            <Field
              label={`Following (current: ${user.following?.length ?? 0})`}
              value={form.followingCount}
              onChange={set("followingCount")}
              type="number"
            />
          </div>

          <SectionTitle>Read-only Info</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 opacity-60">
            <Field label="Referral Code" value={user.referralCode} onChange={() => {}} disabled />
            <Field label="Referred By" value={user.referredBy?.username || "—"} onChange={() => {}} disabled />
            <Field label="Joined" value={new Date(user.createdAt).toLocaleDateString()} onChange={() => {}} disabled />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-muted rounded-lg font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 btn-gradient rounded-lg font-medium text-foreground btn-glow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user) => { setSelectedUser(user); setShowEditModal(true); };

  const handleUserSaved = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? { ...u, ...updatedUser } : u)));
  };

  const toggleUserStatus = async (user) => {
    try {
      const token = localStorage.getItem("adminToken");
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/admin/users/${user._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: !user.isActive } : u));
      toast({ title: user.isActive ? "User Suspended" : "User Activated", description: `${user.username} status updated` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage all registered users</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadUsers} className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary font-medium hover:bg-primary/30 transition-colors">
              Refresh
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-green-500">{users.filter((u) => u.isActive).length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-destructive">{users.filter((u) => !u.isActive).length}</p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">{users.filter((u) => u.kycStatus === "approved").length}</p>
            <p className="text-sm text-muted-foreground">KYC Verified</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">SPX / Tokens</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">KYC</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Followers</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Referrals</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">Loading users…</td></tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground">{(user.spxBalance ?? 0).toFixed(2)} SPX</p>
                        <p className="text-xs text-muted-foreground">{(user.tokenBalance ?? 0).toFixed(2)} tokens</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}>
                          {user.isActive ? "active" : "suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.kycStatus === "approved" ? "bg-primary/20 text-primary" : user.kycStatus === "pending" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"}`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-foreground font-medium">{user.followers?.length ?? 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-foreground font-medium">{user.referralCount || 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-muted-foreground text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className={`p-2 rounded-lg transition-colors ${user.isActive ? "hover:bg-destructive/10 text-destructive" : "hover:bg-green-500/10 text-green-500"}`}
                            title={user.isActive ? "Suspend User" : "Activate User"}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setShowEditModal(false)}
            onSaved={handleUserSaved}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
