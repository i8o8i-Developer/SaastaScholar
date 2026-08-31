import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Loader2,
  ThumbsUp,
  MessageCircle,
  Send,
  Pin,
  Lock,
  Search,
  Flame,
  Clock,
  Sparkles,
  Share2,
  Trash2,
  CornerDownRight,
  ShieldCheck,
  CheckCircle2,
  Hash,
  Filter,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/Hooks/UseAuth";
import { cn } from "@/Lib/Utils";
import { communityApi, ForumPost, ForumComment } from "@/Lib/Api";

const CATEGORIES = [
  { id: "ALL", label: "All Discussions", icon: Sparkles },
  { id: "Announcements", label: "Official Announcements", icon: Pin },
  { id: "Academics", label: "Course & Notes", icon: Hash },
  { id: "Examinations", label: "Exams & PYQs", icon: Hash },
  { id: "Placements", label: "Placements & Internships", icon: Hash },
  { id: "Technical", label: "Tech & Coding", icon: Hash },
  { id: "Campus", label: "Campus & Events", icon: Hash },
  { id: "General", label: "General Chat", icon: MessageSquare },
];

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just Now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m Ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h Ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d Ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export function CommunityForumHub() {
  const { user } = useAuth();
  const isMasterAdmin = Boolean(user?.is_staff || user?.is_superuser || user?.email === "admin@nims.edu.in");

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"NEWEST" | "HOT" | "COMMENTS">("NEWEST");

  // Thread Expanded State: Map Of postId -> boolean
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [replyingToComment, setReplyingToComment] = useState<{ postId: string; commentId: string; authorName: string } | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // New Post Form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newTags, setNewTags] = useState("");

  const fetchPosts = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const data = await communityApi.getPosts();
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      setPosts(list);
    } catch (error: any) {
      if (!quiet) {
        toast.error(error.message || "Failed To Load Community Feed.");
      }
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please Provide Both A Title And Description.");
      return;
    }

    setIsSubmitting(true);
    try {
      await communityApi.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags.trim(),
      });
      toast.success("Thread Published To Community!");
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setShowComposer(false);
      await fetchPosts(true);
    } catch (error: any) {
      toast.error(error.message || "Failed To Publish Discussion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUpvote = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.has_upvoted;
          return {
            ...p,
            has_upvoted: !isLiked,
            upvotes: isLiked ? Math.max(0, p.upvotes - 1) : p.upvotes + 1,
          };
        }
        return p;
      })
    );

    try {
      const res = await communityApi.upvotePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, upvotes: res.upvotes, has_upvoted: res.has_upvoted } : p
        )
      );
    } catch (error: any) {
      toast.error(error.message || "Failed To Register Upvote.");
      fetchPosts(true);
    }
  };

  const handleAddComment = async (postId: string, parentCommentId?: string) => {
    const key = parentCommentId ? `${postId}-${parentCommentId}` : postId;
    const text = (commentInputs[key] || "").trim();
    if (!text) return;

    try {
      await communityApi.createComment(postId, {
        content: text,
        parent_comment: parentCommentId,
      });
      toast.success("Reply Posted!");
      setCommentInputs((prev) => ({ ...prev, [key]: "" }));
      setReplyingToComment(null);
      // Auto expand thread to see new reply
      setExpandedThreads((prev) => ({ ...prev, [postId]: true }));
      await fetchPosts(true);
    } catch (error: any) {
      toast.error(error.message || "Failed To Post Reply.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are You Sure You Want To Delete This Discussion Thread?")) return;
    try {
      await communityApi.deletePost(postId);
      toast.success("Thread Removed.");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error: any) {
      toast.error(error.message || "Failed To Delete Thread.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete This Comment?")) return;
    try {
      await communityApi.deleteComment(commentId);
      toast.success("Comment Removed.");
      fetchPosts(true);
    } catch (error: any) {
      toast.error(error.message || "Failed To Delete Comment.");
    }
  };

  const handleTogglePin = async (postId: string) => {
    try {
      const res = await communityApi.togglePinPost(postId);
      toast.success(res.is_pinned ? "Thread Pinned To Top!" : "Thread Unpinned.");
      fetchPosts(true);
    } catch (error: any) {
      toast.error("Admin Action Failed.");
    }
  };

  const handleToggleLock = async (postId: string) => {
    try {
      const res = await communityApi.toggleLockPost(postId);
      toast.success(res.is_locked ? "Thread Locked (No New Replies)." : "Thread Unlocked.");
      fetchPosts(true);
    } catch (error: any) {
      toast.error("Admin Action Failed.");
    }
  };

  const handleShare = (post: ForumPost) => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Discussion Link Copied To Clipboard!");
  };

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => {
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inContent = p.content.toLowerCase().includes(q);
        const inAuthor = (p.author_name || "").toLowerCase().includes(q);
        const inCategory = (p.category || "").toLowerCase().includes(q);
        if (!inTitle && !inContent && !inAuthor && !inCategory) return false;
      }
      return true;
    });

    if (sortBy === "HOT") {
      result = [...result].sort((a, b) => b.upvotes + (b.comments_count || 0) * 2 - (a.upvotes + (a.comments_count || 0) * 2));
    } else if (sortBy === "COMMENTS") {
      result = [...result].sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    } else {
      // Newest (with pinned at top)
      result = [...result].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return result;
  }, [posts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Community Discussions & Peer Hub
              </h2>
              <p className="text-xs text-muted-foreground">
                Slack & Reddit-Style Public Threads • Connect With Fellow Scholars & Faculty
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowComposer(!showComposer)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{showComposer ? "Close Composer" : "Start New Discussion"}</span>
        </button>
      </div>

      {/* New Post Composer */}
      {showComposer && (
        <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Create A New Thread In The Forum
            </h3>
            <span className="text-[0.65rem] text-muted-foreground uppercase font-bold tracking-wider">
              Posting As: {user?.full_name || user?.email}
            </span>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-bold text-muted-foreground">Thread Title *</label>
                <input
                  type="text"
                  placeholder="What Would You Like To Ask Or Share?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-muted-foreground">Channel / Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="General">General Chat</option>
                  <option value="Academics">Course & Notes</option>
                  <option value="Examinations">Exams & Solved PYQs</option>
                  <option value="Placements">Placements & Internships</option>
                  <option value="Technical">Tech & Coding</option>
                  <option value="Campus">Campus & Events</option>
                  {isMasterAdmin && <option value="Announcements">Official Announcements</option>}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-muted-foreground">Thread Content / Markdown Description *</label>
              <textarea
                placeholder="Elaborate On Your Question, Share Code Snippets, Exam Strategies, Or Resources..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                required
                className="w-full rounded-2xl border border-border bg-background p-3.5 font-normal text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <input
                type="text"
                placeholder="Tags (Comma Separated: e.g. BTech, Semester 1, Python, Mid-Term)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="h-9 sm:max-w-md w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="h-9 px-4 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary-deep cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Discussion"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Reddit/Slack Navigation Channels & Filters */}
      <div className="space-y-3 min-w-0">
        {/* Category Channel Bar (Responsive Wrapping Grid) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                    : "border border-border/80 bg-card text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Discussions, Authors, Topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-2xl border border-border/80 bg-card pr-4 pl-10 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface/80 border border-border/70 shrink-0 self-start sm:self-auto min-w-0">
            <span className="text-[0.62rem] font-bold text-muted-foreground uppercase px-1.5 hidden sm:inline">Sort:</span>
            <button
              onClick={() => setSortBy("NEWEST")}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[0.7rem] sm:text-xs font-bold transition-all cursor-pointer",
                sortBy === "NEWEST" ? "bg-card text-foreground border border-border/80 shadow-2xs font-extrabold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setSortBy("HOT")}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[0.7rem] sm:text-xs font-bold transition-all cursor-pointer",
                sortBy === "HOT" ? "bg-card text-foreground border border-border/80 shadow-2xs font-extrabold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setSortBy("COMMENTS")}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[0.7rem] sm:text-xs font-bold transition-all cursor-pointer",
                sortBy === "COMMENTS" ? "bg-card text-foreground border border-border/80 shadow-2xs font-extrabold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
              <span>Discussed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Discussion Feed */}
      {isLoading ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-border/80 bg-card/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          <span className="text-xs font-bold text-muted-foreground">Loading Community Threads...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/30 p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
            <MessageSquare className="h-6 w-6 opacity-60" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">No Discussions Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery ? "Try searching for a different keyword or category." : "Be The First Scholar To Spark An Academic Conversation!"}
          </p>
          <button
            onClick={() => setShowComposer(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-deep cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Thread</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isExpanded = expandedThreads[post.id] || false;
            const canDelete = isMasterAdmin || post.author === user?.id;

            return (
              <div
                key={post.id}
                className={cn(
                  "rounded-3xl border bg-card transition-all duration-200 shadow-2xs hover:border-primary/40",
                  post.is_pinned
                    ? "border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-card to-card"
                    : "border-border/80"
                )}
              >
                <div className="p-5 sm:p-6">
                  {/* Top Bar: Pinned Badge, Category, Author Info & Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[0.65rem] font-extrabold text-amber-600 dark:text-amber-400">
                          <Pin className="h-3 w-3" />
                          <span>Pinned Announcement</span>
                        </span>
                      )}

                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-bold text-foreground/80">
                        #{post.category}
                      </span>

                      {post.is_locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-rose-500">
                          <Lock className="h-3 w-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono text-[0.7rem]">{formatTimeAgo(post.created_at)}</span>
                    </div>
                  </div>

                  {/* Author Header Row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-2xl text-xs font-extrabold shadow-2xs",
                          post.is_staff
                            ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {(post.author_name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{post.author_name}</span>
                          {post.is_staff ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[0.6rem] font-extrabold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-2.5 w-2.5" /> Admin Official
                            </span>
                          ) : (
                            <span className="text-[0.65rem] text-muted-foreground">
                              {post.author_role || "Student"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Moderation Shortcuts */}
                    <div className="flex items-center gap-1">
                      {isMasterAdmin && (
                        <>
                          <button
                            onClick={() => handleTogglePin(post.id)}
                            title={post.is_pinned ? "Unpin Discussion" : "Pin Discussion"}
                            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <Pin className={cn("h-3.5 w-3.5", post.is_pinned && "text-amber-500 fill-amber-500")} />
                          </button>
                          <button
                            onClick={() => handleToggleLock(post.id)}
                            title={post.is_locked ? "Unlock Discussion" : "Lock Discussion"}
                            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Lock className={cn("h-3.5 w-3.5", post.is_locked && "text-rose-500 fill-rose-500")} />
                          </button>
                        </>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete Thread"
                          className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Discussion Body */}
                  <div className="space-y-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.split(",").map((t, idx) => (
                          <span key={idx} className="rounded-lg bg-surface px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reddit-Style Action Footer */}
                  <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3 mt-4">
                    <div className="flex items-center gap-2">
                      {/* Upvote Pill */}
                      <button
                        onClick={() => handleToggleUpvote(post.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer active:scale-95",
                          post.has_upvoted
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "border-border/80 bg-surface/60 text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
                        )}
                      >
                        <ThumbsUp className={cn("h-3.5 w-3.5", post.has_upvoted && "fill-emerald-600 dark:fill-emerald-400")} />
                        <span>{post.upvotes || 0}</span>
                      </button>

                      {/* Comment Toggle */}
                      <button
                        onClick={() =>
                          setExpandedThreads((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                          isExpanded
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/80 bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground"
                        )}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>{post.comments_count || post.comments?.length || 0} Replies</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShare(post)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-surface/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      >
                        <Share2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slack/Reddit Thread Replies Section */}
                {isExpanded && (
                  <div className="border-t border-border/70 bg-surface/30 p-5 sm:p-6 space-y-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        Discussion Thread ({post.comments?.length || 0} Comments)
                      </h4>
                    </div>

                    {/* Top Level Comments List */}
                    <div className="space-y-3">
                      {(post.comments || []).length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground italic">
                          No Replies Yet. Join The Conversation Below!
                        </div>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="space-y-2">
                            {/* Main Comment Bubble */}
                            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "grid h-6 w-6 place-items-center rounded-xl text-[0.65rem] font-bold",
                                      comment.is_staff
                                        ? "bg-emerald-600 text-white"
                                        : "bg-primary/10 text-primary"
                                    )}
                                  >
                                    {(comment.author_name || "S").charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-bold text-foreground">{comment.author_name}</span>
                                  {comment.is_staff && (
                                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[0.55rem] font-extrabold text-emerald-600 dark:text-emerald-400">
                                      Admin
                                    </span>
                                  )}
                                  <span className="text-[0.65rem] text-muted-foreground">
                                    • {formatTimeAgo(comment.created_at)}
                                  </span>
                                </div>

                                {(isMasterAdmin || comment.author === user?.id) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    title="Delete Comment"
                                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs text-foreground/90 whitespace-pre-wrap pl-8">
                                {comment.content}
                              </p>

                              {/* Nested Reply Action */}
                              {!post.is_locked && (
                                <div className="pl-8 pt-1">
                                  <button
                                    onClick={() =>
                                      setReplyingToComment(
                                        replyingToComment?.commentId === comment.id
                                          ? null
                                          : { postId: post.id, commentId: comment.id, authorName: comment.author_name }
                                      )
                                    }
                                    className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                  >
                                    <CornerDownRight className="h-3 w-3" />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Nested Replies Tree (Reddit-style line connector) */}
                            {(comment.replies || []).map((reply) => (
                              <div key={reply.id} className="ml-6 sm:ml-8 pl-3 border-l-2 border-primary/20 space-y-1">
                                <div className="rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-2xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={cn(
                                          "grid h-5 w-5 place-items-center rounded-lg text-[0.6rem] font-bold",
                                          reply.is_staff
                                            ? "bg-emerald-600 text-white"
                                            : "bg-primary/10 text-primary"
                                        )}
                                      >
                                        {(reply.author_name || "S").charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-xs font-bold text-foreground">{reply.author_name}</span>
                                      {reply.is_staff && (
                                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[0.55rem] font-extrabold text-emerald-600 dark:text-emerald-400">
                                          Admin
                                        </span>
                                      )}
                                      <span className="text-[0.65rem] text-muted-foreground">
                                        • {formatTimeAgo(reply.created_at)}
                                      </span>
                                    </div>

                                    {(isMasterAdmin || reply.author === user?.id) && (
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        title="Delete Reply"
                                        className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-foreground/90 whitespace-pre-wrap pl-7">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}

                            {/* Nested Reply Input Box */}
                            {replyingToComment?.commentId === comment.id && (
                              <div className="ml-6 sm:ml-8 pl-3 border-l-2 border-primary/40 pt-1">
                                <div className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-card p-2 shadow-xs">
                                  <input
                                    type="text"
                                    placeholder={`Reply To ${replyingToComment.authorName}...`}
                                    value={commentInputs[`${post.id}-${comment.id}`] || ""}
                                    onChange={(e) =>
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [`${post.id}-${comment.id}`]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment(post.id, comment.id);
                                      }
                                    }}
                                    className="flex-1 bg-transparent px-2.5 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post.id, comment.id)}
                                    className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep transition-all cursor-pointer"
                                  >
                                    <Send className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Top Level Comment Box */}
                    {post.is_locked ? (
                      <div className="rounded-2xl border border-border/80 bg-surface/80 p-3 text-center text-xs text-muted-foreground">
                        🔒 This thread has been locked by administration. No further replies can be submitted.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Write A Public Reply To This Discussion (Press Enter)..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            className="h-10 w-full rounded-2xl border border-border bg-card pr-10 pl-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none shadow-xs"
                          />
                        </div>
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="h-10 px-4 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Reply</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
