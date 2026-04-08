import { useState, useContext, useEffect, useRef, useCallback } from "react";
import {
  Heart, Share2, MessageCircle, Image as ImageIcon, X, Send,
  MoreHorizontal, ChevronDown, Loader2, Trash2, Video, Play, Eye,
  UserPlus, UserCheck,
} from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getInitials(name = "") {
  return name.slice(0, 2).toUpperCase() || "??";
}

function formatCount(n = 0) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ username, size = "md" }) => {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0`}>
      <span className="font-bold text-primary">{getInitials(username)}</span>
    </div>
  );
};

// ── Comment ──────────────────────────────────────────────────────────────────

const CommentItem = ({ comment }) => (
  <div className="flex gap-2 items-start">
    <Avatar username={comment.username} size="sm" />
    <div className="bg-secondary/20 rounded-xl px-3 py-2 flex-1 min-w-0">
      <p className="text-xs font-semibold text-foreground">{comment.username}</p>
      <p className="text-xs text-muted-foreground break-words">{comment.text}</p>
    </div>
  </div>
);

// ── Video Player with view tracking ──────────────────────────────────────────

const VideoPlayer = ({ src, postId, onView }) => {
  const videoRef  = useRef(null);
  const viewFired = useRef(false);

  const handlePlay = () => {
    if (!viewFired.current) {
      viewFired.current = true;
      onView(postId);
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      playsInline
      preload="metadata"
      onPlay={handlePlay}
      className="w-full max-h-96"
      style={{ display: "block" }}
    />
  );
};

// ── Follow Button ─────────────────────────────────────────────────────────────

const FollowButton = ({ targetUserId, currentUserId }) => {
  const [following, setFollowing] = useState(null); // null = loading
  const [busy, setBusy]           = useState(false);
  const { toast }                 = useToast();

  // Don't show for own posts
  if (!targetUserId || targetUserId === currentUserId) return null;

  // Lazy-load follow status on first render
  useEffect(() => {
    apiService.getFollowStatus(targetUserId)
      .then(res => setFollowing(res.following))
      .catch(() => setFollowing(false));
  }, [targetUserId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (busy || following === null) return;
    setBusy(true);
    try {
      const res = await apiService.followUser(targetUserId);
      setFollowing(res.following);
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not follow user", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (following === null) return null; // still loading — show nothing

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
        following
          ? "bg-secondary/40 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
          : "bg-primary/15 text-primary hover:bg-primary/25"
      }`}
    >
      {busy
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : following ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />
      }
      {following ? "Following" : "Follow"}
    </button>
  );
};

// ── Post Card ─────────────────────────────────────────────────────────────────

const PostCard = ({ post, currentUser, onLike, onShare, onDelete, onComment, onView }) => {
  const [showComments, setShowComments]     = useState(false);
  const [comments, setComments]             = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText]       = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [showMenu, setShowMenu]             = useState(false);
  const [localViews, setLocalViews]         = useState(post.views ?? 0);
  const viewFired                           = useRef(false);
  const navigate                            = useNavigate();
  const { toast }                           = useToast();

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const postUserId    = post.userId?.toString();
  const isOwn         = !!currentUserId && postUserId === currentUserId;

  const mediaUrl  = post.mediaUrl  || post.imageUrl  || null;
  const mediaType = post.mediaType || (post.imageUrl ? "image" : null);

  // Track view when image post enters viewport
  const cardRef = useRef(null);
  useEffect(() => {
    if (mediaType !== "image" || viewFired.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewFired.current) {
          viewFired.current = true;
          onView(post._id);
          setLocalViews(v => v + 1);
        }
      },
      { threshold: 0.6 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [mediaType, post._id, onView]);

  const handleVideoView = (postId) => {
    onView(postId);
    setLocalViews(v => v + 1);
  };

  const loadComments = async () => {
    if (commentsLoaded) return;
    try {
      const data = await apiService.request(`/feed/${post._id}/comments`);
      setComments(data.comments || []);
      setCommentsLoaded(true);
    } catch {
      toast({ title: "Error", description: "Could not load comments.", variant: "destructive" });
    }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(v => !v);
  };

  const handleComment = async () => {
    if (!commentText.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      const data = await apiService.request(`/feed/${post._id}/comment`, {
        method: "POST",
        body: { text: commentText.trim() },
      });
      setComments(prev => [...prev, data.comment]);
      onComment(post._id, data.commentCount);
      setCommentText("");
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not post comment.", variant: "destructive" });
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div ref={cardRef} className="bg-card border border-border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => postUserId && navigate(`/profile/${postUserId}`)}
            className="shrink-0"
          >
            <Avatar username={post.username} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => postUserId && navigate(`/profile/${postUserId}`)}
                className="font-semibold text-foreground text-sm hover:underline"
              >
                {post.username}
              </button>
              {/* Follow button — only shown for other users' posts */}
              {!isOwn && (
                <FollowButton targetUserId={postUserId} currentUserId={currentUserId} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button onClick={() => setShowMenu(v => !v)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-xl z-10 min-w-[130px] overflow-hidden">
              {isOwn && (
                <button
                  onClick={() => { setShowMenu(false); onDelete(post._id); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
              <button
                onClick={() => { setShowMenu(false); onShare(post._id); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/20 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {mediaUrl && mediaType === "image" && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-border">
          <img src={mediaUrl} alt="post" className="w-full object-cover max-h-80" loading="lazy" />
        </div>
      )}

      {/* Video */}
      {mediaUrl && mediaType === "video" && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-border bg-black">
          <VideoPlayer src={mediaUrl} postId={post._id} onView={handleVideoView} />
        </div>
      )}

      {/* Stats row */}
      <div className="px-4 pb-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />{formatCount(post.likeCount ?? 0)}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />{formatCount(localViews)}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />{formatCount(post.commentCount ?? 0)}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Share2 className="w-3 h-3" />{formatCount(post.shares ?? 0)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
            post.liked ? "text-red-400 bg-red-500/10" : "text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          }`}
        >
          <Heart className={`w-4 h-4 ${post.liked ? "fill-red-400" : ""}`} />
          Like
        </button>

        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
            showComments ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>

        <button
          onClick={() => onShare(post._id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-all text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
          )}
          {comments.map((c, i) => (
            <CommentItem key={c._id || i} comment={c} />
          ))}
          <div className="flex gap-2 items-center pt-1">
            <Avatar username={currentUser?.username} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
                placeholder="Write a comment…"
                maxLength={500}
                className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || sendingComment}
                className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center disabled:opacity-40 hover:bg-primary/30 transition-all"
              >
                {sendingComment
                  ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  : <Send className="w-3.5 h-3.5 text-primary" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Create Post ───────────────────────────────────────────────────────────────

const CreatePost = ({ currentUser, onPosted }) => {
  const [text, setText]           = useState("");
  const [mediaUrl, setMediaUrl]   = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting]     = useState(false);
  const fileRef                   = useRef();
  const { toast }                 = useToast();

  const handleMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast({ title: "Invalid file", description: "Only images and videos allowed.", variant: "destructive" });
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB for both images and videos
    if (file.size > maxSize) {
      toast({ title: "Too large", description: "Max 25MB for photos and videos", variant: "destructive" });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview({ url: localUrl, type: isVideo ? "video" : "image" });
    setUploading(true);

    // Use FormData (multipart) — avoids base64 bloat and Nginx body-size limits
    (async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${import.meta.env.VITE_API_URL || "https://socialpayx.com/api"}/upload`, {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            // Do NOT set Content-Type — browser sets it with boundary automatically
          },
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Upload failed");

        setMediaUrl(data.url);
        setMediaType(data.type);
        toast({ title: "Uploaded ✅", description: "Media ready to post." });
      } catch (err) {
        toast({ title: "Upload failed", description: err.message, variant: "destructive" });
        setPreview(null);
        setMediaUrl(null);
        setMediaType(null);
      } finally {
        setUploading(false);
      }
    })();
  };

  const removeMedia = () => {
    setPreview(null);
    setMediaUrl(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePost = async () => {
    if ((!text.trim() && !mediaUrl) || posting || uploading) return;
    setPosting(true);
    try {
      const data = await apiService.request("/feed", {
        method: "POST",
        body: { content: text.trim(), mediaUrl, mediaType },
      });
      onPosted(data.post);
      setText("");
      removeMedia();
      toast({ title: "Posted! 🎉", description: "Your post is live." });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not create post.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-4">
      <div className="flex gap-3">
        <Avatar username={currentUser?.username} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share a photo, video, or thought…"
            rows={2}
            maxLength={1000}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none"
          />

          {/* Preview */}
          {preview && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-border bg-black">
              {preview.type === "image"
                ? <img src={preview.url} alt="preview" className="w-full object-cover max-h-48" />
                : <video src={preview.url} className="w-full max-h-48" controls playsInline />
              }
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <span className="text-white text-xs">Uploading to cloud…</span>
                </div>
              )}
              {!uploading && (
                <button onClick={removeMedia} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { if(fileRef.current){ fileRef.current.accept="image/*"; fileRef.current.click(); } }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Photo
              </button>
              <button
                onClick={() => { if(fileRef.current){ fileRef.current.accept="video/*"; fileRef.current.click(); } }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Video className="w-4 h-4" /> Video
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMedia} className="hidden" />

            <button
              onClick={handlePost}
              disabled={(!text.trim() && !mediaUrl) || posting || uploading}
              className="px-5 py-1.5 btn-gradient rounded-xl text-sm font-semibold text-foreground disabled:opacity-40 btn-glow transition-all flex items-center gap-2"
            >
              {(posting || uploading) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {uploading ? "Uploading…" : posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Feed Page ────────────────────────────────────────────────────────────

const SocialFeed = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate                  = useNavigate();
  const { toast }                 = useToast();

  const [currentUser, setCurrentUser] = useState(user);
  const [posts, setPosts]             = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { if (!isAuthenticated) navigate("/"); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiService.getProfile()
      .then(profile => setCurrentUser(profile))
      .catch(() => setCurrentUser(user));
  }, [isAuthenticated]);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const data = await apiService.request(`/feed?page=${pageNum}&limit=10`);
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch {
      toast({ title: "Error", description: "Could not load feed.", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => { if (isAuthenticated) fetchPosts(1); }, [isAuthenticated, fetchPosts]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchPosts(page + 1, true);
  };

  const handlePosted = (newPost) => setPosts(prev => [newPost, ...prev]);

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, liked: !p.liked, likeCount: p.liked ? (p.likeCount ?? 1) - 1 : (p.likeCount ?? 0) + 1 }
        : p
    ));
    try {
      await apiService.request(`/feed/${postId}/like`, { method: "POST" });
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p =>
        p._id === postId
          ? { ...p, liked: !p.liked, likeCount: p.liked ? (p.likeCount ?? 1) - 1 : (p.likeCount ?? 0) + 1 }
          : p
      ));
    }
  };

  const handleView = async (postId) => {
    try {
      await apiService.request(`/feed/${postId}/view`, { method: "POST" });
    } catch {}
  };

  const handleShare = async (postId) => {
    try {
      await apiService.request(`/feed/${postId}/share`, { method: "POST" });
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, shares: (p.shares ?? 0) + 1 } : p
      ));
    } catch {}
    if (navigator.share) {
      navigator.share({ title: "SocialPayX", url: window.location.origin + "/feed" }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + "/feed");
      toast({ title: "Link copied!" });
    }
  };

  const handleDelete = async (postId) => {
    try {
      await apiService.request(`/feed/${postId}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast({ title: "Deleted", description: "Post removed." });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not delete post.", variant: "destructive" });
    }
  };

  const handleComment = (postId, newCount) => {
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentCount: newCount } : p));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Social Feed</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">{posts.length} posts</span>
        </div>
      </header>

      <div className="px-4 pt-4">
        <CreatePost currentUser={currentUser} onPosted={handlePosted} />

        {posts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Play className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share a photo or video!</p>
          </div>
        )}

        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onShare={handleShare}
              onDelete={handleDelete}
              onComment={handleComment}
              onView={handleView}
            />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full mt-4 py-3 border border-border rounded-xl text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            {loadingMore ? "Loading…" : "Load more posts"}
          </button>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4 pb-2">You're all caught up ✓</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default SocialFeed;
