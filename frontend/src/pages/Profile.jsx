import { useState, useContext, useEffect } from "react";
import { ArrowLeft, Copy, Check, Edit2, Save, X, LogOut } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [referralData, setReferralData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profile, referrals] = await Promise.all([
        apiService.getProfile(),
        apiService.getReferralInfo()
      ]);
      setUserData(profile);
      setReferralData(referrals);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentUser = userData || user;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiService.updateProfile({ username: newUsername });
      setEditingUsername(false);
      toast({ title: "Success", description: "Username updated successfully" });
      
      const updatedUser = { ...currentUser, username: newUsername };
      setUserData(updatedUser);
      login(updatedUser, localStorage.getItem('token'));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{currentUser?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                      placeholder={currentUser?.username}
                    />
                    <button onClick={updateUsername} className="p-2 bg-green-500 text-white rounded-lg">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingUsername(false)} className="p-2 bg-red-500 text-white rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-foreground">{currentUser?.username}</h2>
                    <button 
                      onClick={() => { setEditingUsername(true); setNewUsername(currentUser?.username || ''); }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-primary">{currentUser?.spxBalance?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">SPX Balance</p>
            </div>
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-green-500">{currentUser?.totalMined?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Total Mined</p>
            </div>
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-accent">{referralData?.referralCount || 0}</p>
              <p className="text-sm text-muted-foreground">Referrals</p>
            </div>
            <div className="text-center p-4 bg-input rounded-lg">
              <p className="text-2xl font-bold text-orange-500">{referralData?.referralEarnings?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Referral Earnings</p>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">KYC Verification</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-input rounded-lg">
              <div>
                <p className="font-medium text-foreground">Verification Status</p>
                <p className="text-sm text-muted-foreground">Required for mining and withdrawals</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                userData?.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                userData?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {userData?.kycStatus === 'approved' ? 'Verified' :
                 userData?.kycStatus === 'pending' ? '⏳ Pending' : '❌ Required'}
              </div>
            </div>
            
            {userData?.kycStatus !== 'approved' && (
              <button
                onClick={() => navigate('/kyc')}
                className="w-full py-3 btn-gradient rounded-lg font-semibold text-foreground btn-glow"
              >
                {userData?.kycStatus === 'pending' ? 'View KYC Status' : 'Complete KYC Verification'}
              </button>
            )}
          </div>
        </div>

        {/* Referral System */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Referral System</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Referral Code</label>
              <div className="flex items-center gap-2 p-3 bg-input border border-border rounded-lg">
                <span className="font-mono text-lg flex-1">{referralData?.referralCode || currentUser?.referralCode || 'Loading...'}</span>
                <button 
                  onClick={() => handleCopy(referralData?.referralCode || currentUser?.referralCode)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Referral Link</label>
              <div className="flex items-center gap-2 p-3 bg-input border border-border rounded-lg">
                <span className="text-sm flex-1 truncate">https://socialpayx.com/ref/{referralData?.referralCode || currentUser?.referralCode}</span>
                <button
                  onClick={() => handleCopy(`https://socialpayx.com/ref/${referralData?.referralCode || currentUser?.referralCode}`)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-input rounded-lg text-center">
                <p className="text-xl font-bold text-foreground">{referralData?.referralCount || 0}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
              <div className="p-4 bg-input rounded-lg text-center">
                <p className="text-xl font-bold text-primary">{referralData?.referralEarnings?.toFixed(4) || '0.0000'} SPX</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>

            {/* Commission Rate */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">Referral Commission: {((referralData?.referralCommission || 0.1) * 100).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Earn {((referralData?.referralCommission || 0.1) * 100).toFixed(0)}% of your referrals' mining rewards</p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Referrals</h3>
            <div className="space-y-3">
              {referralData.referredUsers.slice(0, 5).map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-input rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{referral.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{referral.totalMined?.toFixed(4) || '0.0000'} SPX</p>
                    <p className="text-xs text-muted-foreground">Total Mined</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/');
            window.location.reload();
          }}
          className="w-full py-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;