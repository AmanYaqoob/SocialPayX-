import { useState, useContext, useEffect, useCallback } from "react";
import {
  ArrowLeft, Copy, Check, Edit2, Save, X, LogOut,
  Heart, Eye, MessageCircle, Share2, Video, Image as ImageIcon,
  Users, TrendingUp, Grid, Play, Film, Loader2, UserPlus, UserCheck,
} from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";
import BottomNav from "../components/BottomNav.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n = 0) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color = "text-primary", bg = "bg-primary/10" }) => (
  <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2">
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className={`text-xl font-bold ${color}`}>{formatNumber(value)}</p>
    <p className="text-xs text-muted-foreground text-center">{label}</p>
  </div>
);

// ── Post Thumbnail ─────────────────────────────────────────────────────────────

const PostThumbnail = ({ post }) => {
  const hasVideo = post.mediaType === "video" && post.mediaUrl;
  const hasImage = post.mediaUrl && !hasVideo;

  return (
    <div className="relative aspect-square bg-secondary/20 rounded-xl overflow-hidden border border-border group cursor-pointer">
      {hasVideo && (
        <>
          <video src={post.mediaUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Play className="w-7 h-7 text-white fill-white drop-shadow" />
          </div>
        </>
      )}
      {hasImage && (
        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
      )}
      {!hasVideo && !hasImage && (
        <div className="w-full h-full flex items-center justify-center p-2">
          <p className="text-xs text-muted-foreground text-center line-clamp-4">{post.content}</p>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <div className="flex items-center gap-2 text-white text-xs w-full">
          <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 fill-white" />{formatNumber(post.likes)}</span>
          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatNumber(post.views)}</span>
          <span className="ml-auto">
            {post.mediaType === "video" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Followers / Following Modal ───────────────────────────────────────────────

const FollowListModal = ({ title, userId, type, onClose }) => {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate            = useNavigate();

  useEffect(() => {
    (type === "followers"
      ? apiService.getFollowers(userId)
      : apiService.getFollowing(userId)
    )
      .then(data => setList(data[type] || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [userId, type]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm max-h-[60vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[50vh] p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
          {!loading && list.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No {type} yet</p>
          )}
          {!loading && list.map(u => (
            <div
              key={u._id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/20 cursor-pointer transition-colors"
              onClick={() => { onClose(); navigate(`/profile/${u._id}`); }}
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{u.username?.charAt(0)?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{u.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Profile ──────────────────────────────────────────────────────────────

const Profile = () => {
  const { user, login, logout } = useContext(AuthContext);
  const { userId: paramUserId } = useParams();          // optional :userId for other users' profiles
  const navigate = useNavigate();
  const { toast } = useToast();

  const viewingOwnProfile = !paramUserId || paramUserId === user?._id?.toString() || paramUserId === user?.id?.toString();
  const targetUserId = viewingOwnProfile ? (user?._id || user?.id) : paramUserId;

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername]         = useState("");
  const [referralData, setReferralData]       = useState(null);
  const [userData, setUserData]               = useState(null);
  const [socialStats, setSocialStats]         = useState(null);
  const [copied, setCopied]                   = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState("posts");
  const [followModal, setFollowModal]         = useState(null); // "followers" | "following" | null
  const [isFollowing, setIsFollowing]         = useState(false);
  const [followLoading, setFollowLoading]     = useState(false);
  const [followerCount, setFollowerCount]     = useState(0);

  const loadData = useCallback(async () => {
    try {
      if (viewingOwnProfile) {
        const [profile, referrals, stats] = await Promise.all([
          apiService.getProfile(),
          apiService.getReferralInfo(),
          apiService.getSocialStats(),
        ]);
        setUserData(profile);
        setReferralData(referrals);
        setSocialStats(stats);
        setFollowerCount(stats?.followers ?? 0);
      } else {
        // Viewing someone else's profile
        const [status, publicProfile] = await Promise.all([
          apiService.getFollowStatus(targetUserId).catch(() => ({ following: false, followersCount: 0, followingCount: 0 })),
          apiService.request(`/user/${targetUserId}/public`).catch(() => null),
        ]);
        setIsFollowing(status.following);
        setFollowerCount(status.followersCount);
        if (publicProfile) {
          setUserData({ username: publicProfile.username, _id: publicProfile._id });
          setSocialStats({
            totalPosts:  publicProfile.totalPosts,
            totalLikes:  publicProfile.totalLikes,
            totalViews:  publicProfile.totalViews,
            followers:   publicProfile.followersCount,
            following:   publicProfile.followingCount,
            recentPosts: publicProfile.recentPosts,
          });
          setFollowerCount(publicProfile.followersCount);
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [targetUserId, viewingOwnProfile, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Fetch follow status when viewing own profile too (so stats are from real followers array)
  useEffect(() => {
    if (viewingOwnProfile && socialStats) {
      setFollowerCount(socialStats.followers ?? 0);
    }
  }, [socialStats, viewingOwnProfile]);

  const currentUser = userData || user;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      toast({ title: "Error", description: "Username cannot be empty", variant: "destructive" });
      return;
    }
    try {
      await apiService.updateProfile({ username: newUsername });
      setEditingUsername(false);
      const updated = { ...currentUser, username: newUsername };
      setUserData(updated);
      login(updated, localStorage.getItem("token"));
      toast({ title: "Username updated!" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to update", variant: "destructive" });
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await apiService.followUser(targetUserId);
      setIsFollowing(res.following);
      setFollowerCount(res.followersCount);
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not follow user", variant: "destructive" });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tabs = viewingOwnProfile
    ? [
        { id: "posts",     label: "Posts",     icon: Grid },
        { id: "stats",     label: "Stats",     icon: TrendingUp },
        { id: "referrals", label: "Referrals", icon: Users },
      ]
    : [
        { id: "posts", label: "Posts", icon: Grid },
      ];

  const refCode = referralData?.referralCode || currentUser?.referralCode || "";

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">
          {viewingOwnProfile ? "Profile" : currentUser?.username || "Profile"}
        </h1>
      </header>

      <div className="max-w-2xl mx-auto">

        {/* ── Hero card ── */}
        <div className="px-4 pt-5 pb-4">
          <div className="bg-card border border-border rounded-2xl p-5">

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-primary">
                  {currentUser?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {viewingOwnProfile && editingUsername ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-1.5 bg-input border border-border rounded-lg text-foreground text-sm"
                      placeholder={currentUser?.username}
                      autoFocus
                    />
                    <button onClick={updateUsername} className="p-1.5 bg-green-500 text-white rounded-lg shrink-0">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingUsername(false)} className="p-1.5 bg-red-500 text-white rounded-lg shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-foreground truncate">{currentUser?.username}</h2>
                    {viewingOwnProfile && (
                      <button
                        onClick={() => { setEditingUsername(true); setNewUsername(currentUser?.username || ""); }}
                        className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-sm text-muted-foreground truncate">{currentUser?.email}</p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {viewingOwnProfile && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      userData?.kycStatus === "approved" ? "bg-green-500/20 text-green-400" :
                      userData?.kycStatus === "pending"  ? "bg-yellow-500/20 text-yellow-400" :
                                                           "bg-red-500/20 text-red-400"
                    }`}>
                      {userData?.kycStatus === "approved" ? "✓ Verified" :
                       userData?.kycStatus === "pending"  ? "⏳ KYC Pending" : "❌ KYC Required"}
                    </span>
                  )}

                  {/* Follow button for other users' profiles */}
                  {!viewingOwnProfile && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isFollowing
                          ? "bg-secondary/40 text-foreground hover:bg-red-500/10 hover:text-red-400"
                          : "btn-gradient text-foreground btn-glow"
                      }`}
                    >
                      {followLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />
                      }
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats bar */}
            <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-border text-center">
              {[
                { label: "Posts",     value: socialStats?.totalPosts ?? 0 },
                {
                  label: "Followers",
                  value: followerCount,
                  onClick: () => setFollowModal("followers"),
                  clickable: true,
                },
                {
                  label: "Following",
                  value: socialStats?.following ?? 0,
                  onClick: () => setFollowModal("following"),
                  clickable: true,
                },
                { label: "Likes",     value: socialStats?.totalLikes ?? 0 },
              ].map(s => (
                <div
                  key={s.label}
                  onClick={s.clickable ? s.onClick : undefined}
                  className={s.clickable ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}
                >
                  <p className="font-bold text-foreground text-sm">{formatNumber(s.value)}</p>
                  <p className={`text-xs ${s.clickable ? "text-primary" : "text-muted-foreground"}`}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-4 mb-4">
          <div className="flex bg-card border border-border rounded-2xl p-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── POSTS TAB ── */}
        {activeTab === "posts" && (
          <div className="px-4 space-y-3">
            {!socialStats?.recentPosts?.length ? (
              <div className="text-center py-14 text-muted-foreground">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No posts yet</p>
                <p className="text-sm mt-1">Share your first photo or video!</p>
                {viewingOwnProfile && (
                  <button
                    onClick={() => navigate("/feed")}
                    className="mt-4 px-6 py-2 btn-gradient rounded-xl text-sm font-semibold text-foreground btn-glow"
                  >
                    Go to Feed
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{socialStats.totalPosts} total posts</p>
                <div className="grid grid-cols-3 gap-2">
                  {socialStats.recentPosts.map(post => (
                    <PostThumbnail key={post._id} post={post} />
                  ))}
                </div>
                {socialStats.totalPosts > 6 && (
                  <button
                    onClick={() => navigate("/feed")}
                    className="w-full py-2.5 border border-border rounded-xl text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-all"
                  >
                    View all {socialStats.totalPosts} posts in Feed
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === "stats" && (
          <div className="px-4 space-y-5">

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">📊 Social Activity</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Heart}         label="Total Likes"    value={socialStats?.totalLikes    ?? 0} color="text-red-400"    bg="bg-red-500/10" />
                <StatCard icon={Eye}           label="Total Views"    value={socialStats?.totalViews    ?? 0} color="text-blue-400"   bg="bg-blue-500/10" />
                <StatCard icon={MessageCircle} label="Comments"       value={socialStats?.totalComments ?? 0} color="text-green-400"  bg="bg-green-500/10" />
                <StatCard icon={Share2}        label="Shares"         value={socialStats?.totalShares   ?? 0} color="text-purple-400" bg="bg-purple-500/10" />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">👥 Followers</p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setFollowModal("followers")}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold text-primary">{formatNumber(followerCount)}</p>
                  <p className="text-xs text-muted-foreground text-center">Followers</p>
                </div>
                <div
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setFollowModal("following")}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-xl font-bold text-orange-400">{formatNumber(socialStats?.following ?? 0)}</p>
                  <p className="text-xs text-muted-foreground text-center">Following</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">🎬 Content</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Video}     label="Videos Posted"  value={socialStats?.videoPosts      ?? 0} color="text-orange-400" bg="bg-orange-500/10" />
                <StatCard icon={ImageIcon} label="Images Posted"  value={socialStats?.imagePosts      ?? 0} color="text-cyan-400"   bg="bg-cyan-500/10" />
                <StatCard icon={Eye}       label="Video Views"    value={socialStats?.totalVideoViews ?? 0} color="text-blue-400"   bg="bg-blue-500/10" />
                <StatCard icon={Heart}     label="Video Likes"    value={socialStats?.totalVideoLikes ?? 0} color="text-red-400"    bg="bg-red-500/10" />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">⛏️ Mining & Wallet</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={TrendingUp} label="SPX Balance"  value={parseFloat((currentUser?.spxBalance ?? 0).toFixed(2))} color="text-primary"     bg="bg-primary/10" />
                <StatCard icon={TrendingUp} label="Total Mined"  value={parseFloat((currentUser?.totalMined  ?? 0).toFixed(2))} color="text-green-400"  bg="bg-green-500/10" />
                <StatCard icon={Users}      label="Referrals"    value={referralData?.referralCount ?? 0}                        color="text-orange-400" bg="bg-orange-500/10" />
                <StatCard icon={TrendingUp} label="Referral SPX" value={parseFloat((referralData?.referralEarnings ?? 0).toFixed(2))} color="text-yellow-400" bg="bg-yellow-500/10" />
              </div>
            </div>
          </div>
        )}

        {/* ── REFERRALS TAB ── */}
        {activeTab === "referrals" && (
          <div className="px-4 space-y-4">

            {/* Referral code */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Your Referral Code</p>
              <div className="flex items-center gap-2 p-3 bg-input border border-border rounded-xl">
                <span className="font-mono text-lg flex-1">{refCode || "Loading…"}</span>
                <button onClick={() => handleCopy(refCode)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <p className="text-sm font-semibold text-foreground">Referral Link</p>
              <div className="flex items-center gap-2 p-3 bg-input border border-border rounded-xl">
                <span className="text-xs flex-1 truncate">https://socialpayx.com/ref/{refCode}</span>
                <button onClick={() => handleCopy(`https://socialpayx.com/ref/${refCode}`)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{referralData?.referralCount ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Referrals</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">{(referralData?.referralEarnings ?? 0).toFixed(4)}</p>
                <p className="text-sm text-muted-foreground mt-1">SPX Earned</p>
              </div>
            </div>

            {/* Commission */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
              <p className="text-sm font-medium text-primary">
                Commission: {((referralData?.referralCommission || 0.1) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Earn {((referralData?.referralCommission || 0.1) * 100).toFixed(0)}% of your referrals' mining rewards
              </p>
            </div>

            {/* Referred users list */}
            {referralData?.referredUsers?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Recent Referrals ({referralData.referredUsers.length})
                </p>
                <div className="space-y-2">
                  {referralData.referredUsers.slice(0, 10).map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-input rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{r.username?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-primary">{(r.totalMined ?? 0).toFixed(4)} SPX</p>
                        <p className="text-xs text-muted-foreground">mined</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── KYC CTA ── */}
        {viewingOwnProfile && userData?.kycStatus !== "approved" && (
          <div className="px-4 mt-5">
            <button
              onClick={() => navigate("/kyc")}
              className="w-full py-3 btn-gradient rounded-xl font-semibold text-foreground btn-glow"
            >
              {userData?.kycStatus === "pending" ? "View KYC Status" : "Complete KYC Verification"}
            </button>
          </div>
        )}

        {/* ── Logout ── */}
        {viewingOwnProfile && (
          <div className="px-4 mt-3 mb-4">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Followers / Following Modal */}
      {followModal && (
        <FollowListModal
          title={followModal === "followers" ? "Followers" : "Following"}
          userId={targetUserId}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Profile;
