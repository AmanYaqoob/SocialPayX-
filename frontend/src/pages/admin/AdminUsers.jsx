import { useState, useEffect } from "react";
import { Search, MoreVertical, Ban, Edit, Eye, UserCheck, UserX } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../../services/api.js";

const AdminUsers = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === "active" ? "suspended" : "active";
        toast({
          title: `User ${newStatus === "active" ? "Activated" : "Suspended"}`,
          description: `${user.username} has been ${newStatus === "active" ? "activated" : "suspended"}`,
        });
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleEditBalance = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const saveBalance = (newBalance) => {
    setUsers(users.map(user => {
      if (user.id === selectedUser.id) {
        return { ...user, balance: parseFloat(newBalance) };
      }
      return user;
    }));
    toast({ title: "Balance Updated", description: `Balance updated to ${newBalance} SPX` });
    setShowEditModal(false);
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
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary font-medium hover:bg-primary/30 transition-colors"
            >
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
            <p className="text-2xl font-bold text-green-500">{users.filter(u => u.isActive).length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-destructive">{users.filter(u => !u.isActive).length}</p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">{users.filter(u => u.kycStatus === "approved").length}</p>
            <p className="text-sm text-muted-foreground">KYC Verified</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Balance</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">KYC</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Referrals</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-foreground">{user.spxBalance?.toFixed(2) || '0.00'} SPX</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? "bg-green-500/20 text-green-500" 
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {user.isActive ? "active" : "suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.kycStatus === "approved" 
                          ? "bg-primary/20 text-primary" 
                          : user.kycStatus === "pending"
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {user.kycStatus}
                      </span>
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
                          onClick={() => handleEditBalance(user)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                          title="Edit Balance"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? "hover:bg-destructive/10 text-destructive" 
                              : "hover:bg-green-500/10 text-green-500"
                          }`}
                          title={user.isActive ? "Suspend User" : "Activate User"}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Balance Modal */}
        {showEditModal && selectedUser && (
          <EditBalanceModal
            user={selectedUser}
            onClose={() => setShowEditModal(false)}
            onSave={saveBalance}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const EditBalanceModal = ({ user, onClose, onSave }) => {
  const [newBalance, setNewBalance] = useState(user.balance.toString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Edit User Balance</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Editing balance for: <span className="text-primary">{user.username}</span>
        </p>
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">New Balance (SPX)</label>
          <input
            type="number"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none input-glow"
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
            onClick={() => onSave(newBalance)}
            className="flex-1 py-3 btn-gradient rounded-lg font-medium text-foreground btn-glow"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
