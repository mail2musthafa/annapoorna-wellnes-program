"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  Smile,
  Send,
  Heart,
  Flame,
  ThumbsUp,
  PartyPopper,
  Sparkles,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  FlameKindling,
  TrendingUp,
  MessageCircle,
  Award,
  ExternalLink,
  Search,
  Check,
  UserPlus,
  Trophy,
  BookOpen,
} from "lucide-react";
import { ApiClient } from "@/lib/api/client";

interface CommentItem {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface ReactionSummary {
  reaction_type: string;
  count: number;
  user_reacted?: boolean;
}

interface PostItem {
  id: string;
  space_id: string;
  space_name?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_badge?: string;
  title?: string;
  content: string;
  media_urls: string[];
  pillar_tag?: string;
  post_type: string;
  is_pinned?: boolean;
  created_at: string;
  reactions: ReactionSummary[];
  total_reactions: number;
  comments: CommentItem[];
  total_comments: number;
}

export default function CommunityForumPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "challenges">("feed");
  const [filterType, setFilterType] = useState<string>("all");
  const [isPosting, setIsPosting] = useState(false);

  // New Post State
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [mediaUrlsInput, setMediaUrlsInput] = useState("");
  const [selectedPillar, setSelectedPillar] = useState("Nutrition");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Active Comment inputs per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Interactive Modals
  const [selectedMemberChat, setSelectedMemberChat] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [sentMessageNotice, setSentMessageNotice] = useState<string | null>(null);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>(["c-1"]);

  // Member Directory Data
  const memberDirectory = [
    {
      id: "m-1",
      name: "Kathy Gaither",
      badge: "🔥 42-Day Streak",
      role: "Cohort Peer Mentor",
      focus: "A1c Reversal & Whole Plant Nutrition",
      avatar: "K",
      location: "Austin, TX",
      bio: "Reversed fasting glucose from 145 to 98 mg/dL with 40-min post-meal walks and zero-oil cooking!",
      isMentor: true,
    },
    {
      id: "m-2",
      name: "James (Jim) Jones",
      badge: "🔥 38-Day Streak",
      role: "Metabolic Champion",
      focus: "Cardiometabolic Fitness & Habit Loops",
      avatar: "J",
      location: "Seattle, WA",
      bio: "Down 22 lbs on the 6-Week Reset. Loving the sprouted mung dal bowls and morning breathwork.",
      isMentor: true,
    },
    {
      id: "m-3",
      name: "Rajesh Kumar",
      badge: "🌱 Week 4 Enrolled",
      role: "Active Member",
      focus: "Sprouted Legumes & Indian Culinary Swap",
      avatar: "R",
      location: "San Jose, CA",
      bio: "Transitioning traditional Indian curries to zero-oil tadka and fiber-rich grain bowls.",
      isMentor: false,
    },
    {
      id: "m-4",
      name: "Sarah Lin",
      badge: "🌙 Sleep Champion",
      role: "Active Member",
      focus: "Circadian Rhythm & Evening Digital Sunset",
      avatar: "S",
      location: "Toronto, Canada",
      bio: "Mastered the 8:30 PM screen curfew. Deep sleep score increased from 42 mins to 1 hr 25 mins!",
      isMentor: false,
    },
    {
      id: "m-5",
      name: "Vikram Malhotra",
      badge: "🧘 Mindful Eater",
      role: "Active Member",
      focus: "30-Chew Technique & Satiety Signaling",
      avatar: "V",
      location: "London, UK",
      bio: "No more afternoon energy slumps after shifting to high-fiber legumes for lunch.",
      isMentor: false,
    },
  ];

  // Active Challenges Data
  const challengesList = [
    {
      id: "c-1",
      title: "Motion is Medicine: 40-Min Post-Meal Walks",
      pillar: "Movement",
      participants: 128,
      duration: "14 Days Active",
      goal: "5 Brisk Walks / Week after largest meal",
      progressPercent: 75,
      description: "Stabilize postprandial glucose surges by taking a 40-minute moderate pace walk within 30 minutes of eating.",
      rewardBadge: "🏃 Glucose Stabilizer Badge",
    },
    {
      id: "c-2",
      title: "7-Day Zero-Oil Anti-Inflammatory Cooking",
      pillar: "Nutrition",
      participants: 94,
      duration: "7 Days",
      goal: "Prepare all dinners using vegetable broth / water sautéing",
      progressPercent: 40,
      description: "Protect endothelial function and enhance insulin sensitivity through zero-oil culinary techniques.",
      rewardBadge: "🥗 Clean Vessel Badge",
    },
    {
      id: "c-3",
      title: "Circadian Sunset: 9:00 PM Screen Curfew",
      pillar: "Restorative Sleep",
      participants: 62,
      duration: "10 Days",
      goal: "Power down phones/laptops 90 mins before bedtime",
      progressPercent: 20,
      description: "Naturally boost endogenous melatonin synthesis for restorative slow-wave stage 3 sleep.",
      rewardBadge: "🌙 Deep Restorer Badge",
    },
    {
      id: "c-4",
      title: "Mindful Satiety: 30-Chew Meal Protocol",
      pillar: "Mindfulness",
      participants: 81,
      duration: "5 Days",
      goal: "Chew each mouthful 30 times with fork rested between bites",
      progressPercent: 60,
      description: "Activate CCK and GLP-1 satiety peptide signaling to prevent overeating.",
      rewardBadge: "🧘 Mindful Satiety Badge",
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, [filterType]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = filterType === "all" ? "/api/v1/community/posts" : `/api/v1/community/posts?post_type=${filterType}`;
      const data = await ApiClient.get<PostItem[]>(url);
      setPosts(data);
    } catch (err) {
      console.error("Failed to load community posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    try {
      const mediaList = mediaUrlsInput
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      await ApiClient.post("/api/v1/community/posts", {
        title: postTitle.trim() || undefined,
        content: postContent.trim(),
        media_urls: mediaList,
        pillar_tag: selectedPillar,
        post_type: mediaList.length > 0 ? "journal" : "discussion",
      });

      setPostContent("");
      setPostTitle("");
      setMediaUrlsInput("");
      setShowMediaInput(false);
      await fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReact = async (postId: string, reactionType: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const exists = p.reactions.find((r) => r.reaction_type === reactionType);
        return {
          ...p,
          total_reactions: p.total_reactions + 1,
          reactions: exists
            ? p.reactions.map((r) =>
                r.reaction_type === reactionType ? { ...r, count: r.count + 1 } : r
              )
            : [...p.reactions, { reaction_type: reactionType, count: 1 }],
        };
      })
    );

    try {
      await ApiClient.post(`/api/v1/community/posts/${postId}/react`, {
        reaction_type: reactionType,
      });
    } catch (err) {
      console.error("Failed to react to post:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    const newCommentItem: CommentItem = {
      id: `local-${Date.now()}`,
      author_id: "u-curr",
      author_name: "Priya Sharma (You)",
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          total_comments: p.total_comments + 1,
          comments: [...p.comments, newCommentItem],
        };
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    try {
      await ApiClient.post(`/api/v1/community/posts/${postId}/comments`, {
        content: commentText.trim(),
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setSentMessageNotice(`Message sent to ${selectedMemberChat.name}!`);
    setTimeout(() => {
      setSelectedMemberChat(null);
      setChatMessage("");
      setSentMessageNotice(null);
    }, 1400);
  };

  const toggleJoinChallenge = (cId: string) => {
    if (joinedChallenges.includes(cId)) {
      setJoinedChallenges(joinedChallenges.filter((id) => id !== cId));
    } else {
      setJoinedChallenges([...joinedChallenges, cId]);
    }
  };

  const emojis = ["🔥", "❤️", "👏", "🎉", "💡", "🥗", "💪", "🧘"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5ddd3] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C35B32] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-950">Community Forum & Cohort Hub</h1>
            <p className="text-xs text-sage-500">Connect with cohort peers, share CGM journals, and celebrate health wins.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveTab("feed");
            const el = document.getElementById("post-creator");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-5 py-2.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Post
        </button>
      </div>

      {/* Main 2-Column Feed + Sidebar Widget Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Subtabs Header: Feed / Members / Challenges */}
          <div className="flex items-center gap-6 border-b border-[#e5ddd3] text-xs font-bold">
            <button
              onClick={() => setActiveTab("feed")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "feed"
                  ? "text-[#C35B32] border-b-2 border-[#C35B32]"
                  : "text-sage-500 hover:text-sage-900"
              }`}
            >
              Live Feed ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "members"
                  ? "text-[#C35B32] border-b-2 border-[#C35B32]"
                  : "text-sage-500 hover:text-sage-900"
              }`}
            >
              Members Directory ({memberDirectory.length})
            </button>
            <button
              onClick={() => setActiveTab("challenges")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "challenges"
                  ? "text-[#C35B32] border-b-2 border-[#C35B32]"
                  : "text-sage-500 hover:text-sage-900"
              }`}
            >
              Active Challenges ({challengesList.length})
            </button>
          </div>

          {/* TAB 1: LIVE FEED */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              {/* Post Creator Box */}
              <div
                id="post-creator"
                className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#163B8A] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    P
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Post title or milestone headline (optional)..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full text-xs font-bold text-sage-900 placeholder:text-sage-400 bg-transparent focus:outline-none mb-1"
                    />
                    <textarea
                      rows={2}
                      placeholder="Share a food journal, CGM reading, walking buddy photo, or question for faculty..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full text-xs text-sage-800 placeholder:text-sage-400 bg-transparent focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {showMediaInput && (
                  <div className="p-3 bg-sand-50 rounded-2xl border border-sand-200 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-sage-500">
                      Attach Image or Video URLs (comma separated):
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..., https://..."
                      value={mediaUrlsInput}
                      onChange={(e) => setMediaUrlsInput(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                  </div>
                )}

                {showEmojiPicker && (
                  <div className="flex items-center gap-2 p-2 bg-sand-50 rounded-2xl border border-sand-200">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setPostContent((prev) => prev + " " + emoji)}
                        className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sand-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaInput(!showMediaInput)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        showMediaInput ? "bg-[#C35B32] text-white" : "bg-sand-100 text-sage-700 hover:bg-sand-200"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Photo / Journal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-sand-100 text-sage-700 hover:bg-sand-200 transition-all cursor-pointer"
                    >
                      <Smile className="w-3.5 h-3.5 text-amber-500" />
                      <span>Emoji</span>
                    </button>

                    <select
                      value={selectedPillar}
                      onChange={(e) => setSelectedPillar(e.target.value)}
                      className="text-xs bg-sand-100 text-sage-800 font-semibold px-3 py-1.5 rounded-full border-none focus:outline-none cursor-pointer"
                    >
                      <option value="Nutrition">🥗 Nutrition</option>
                      <option value="Movement">🏃 Movement</option>
                      <option value="Restorative Sleep">🌙 Sleep</option>
                      <option value="Mindfulness">🧘 Mind</option>
                      <option value="Community">👥 General</option>
                    </select>
                  </div>

                  <button
                    disabled={isPosting || !postContent.trim()}
                    onClick={handleCreatePost}
                    className="px-5 py-2 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isPosting ? "Publishing..." : "Post to Feed"}
                  </button>
                </div>
              </div>

              {/* Feed Filter Bar */}
              <div className="flex items-center justify-between text-xs text-sage-600 px-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sage-400 uppercase text-[10px] tracking-wider">
                    Showing:
                  </span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white border border-[#e5ddd3] rounded-xl px-2.5 py-1 text-xs font-semibold text-sage-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">EVERYTHING</option>
                    <option value="journal">Food & CGM Journals</option>
                    <option value="meal_pic">Recipe Discoveries</option>
                    <option value="discussion">Questions for Faculty</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sage-500">
                  <span className="font-bold text-[10px] uppercase tracking-wider">Sorted By:</span>
                  <span className="font-semibold text-sage-900">LAST ACTIVITY</span>
                </div>
              </div>

              {/* Posts Stream */}
              <div className="space-y-6">
                {loading ? (
                  <div className="py-16 text-center text-sage-500 text-xs font-medium">Loading community stream...</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden space-y-4">
                      {post.comments.length > 0 && (
                        <div className="px-6 pt-4 text-[11px] text-sage-500 font-medium flex items-center gap-1.5 border-b border-sand-50 pb-2">
                          <MessageCircle className="w-3.5 h-3.5 text-[#C35B32]" />
                          <span>{post.comments[0].author_name.split(":")[0]} commented on this recently</span>
                        </div>
                      )}

                      <div className="px-6 pt-2 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#163B8A] to-[#C35B32] text-white font-bold text-xs flex items-center justify-center">
                            {post.author_name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs text-sage-950">{post.author_name}</h4>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
                                {post.author_badge || "🔥 Member"}
                              </span>
                            </div>
                            <p className="text-[11px] text-sage-500">{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {post.space_name}</p>
                          </div>
                        </div>

                        {post.pillar_tag && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {post.pillar_tag}
                          </span>
                        )}
                      </div>

                      <div className="px-6 space-y-2">
                        {post.title && <h3 className="font-serif text-base font-bold text-sage-900">{post.title}</h3>}
                        <p className="text-xs text-sage-800 leading-relaxed font-light whitespace-pre-line">{post.content}</p>
                      </div>

                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="px-6">
                          <div
                            className={`grid gap-3 rounded-2xl overflow-hidden ${
                              post.media_urls.length === 1
                                ? "grid-cols-1"
                                : post.media_urls.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-3"
                            }`}
                          >
                            {post.media_urls.map((imgUrl, idx) => (
                              <div key={idx} className="relative h-60 bg-sand-200 rounded-2xl overflow-hidden group">
                                <img src={imgUrl} alt={`Post media ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="px-6 pt-2 flex items-center justify-between text-xs text-sage-500 border-t border-sand-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-1">
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center border border-white">❤️</span>
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center border border-white">🔥</span>
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center border border-white">👏</span>
                          </div>
                          <span className="font-semibold text-sage-700">{post.total_reactions} reactions</span>
                        </div>
                        <span>{post.total_comments} comments</span>
                      </div>

                      <div className="px-6 py-2 bg-[#faf7f2] border-t border-b border-sand-100 flex items-center justify-between text-xs font-semibold text-sage-700">
                        <button onClick={() => handleReact(post.id, "🔥")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-sand-200 transition-colors text-amber-800 cursor-pointer">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>Inspire</span>
                        </button>
                        <button onClick={() => handleReact(post.id, "❤️")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-sand-200 transition-colors text-rose-700 cursor-pointer">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>Support</span>
                        </button>
                        <button onClick={() => handleReact(post.id, "👏")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-sand-200 transition-colors text-emerald-800 cursor-pointer">
                          <ThumbsUp className="w-4 h-4 text-emerald-600" />
                          <span>Celebrate</span>
                        </button>
                      </div>

                      <div className="px-6 pb-6 space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sage-900">{comment.author_name}</span>
                              <span className="text-[10px] text-sage-400">{new Date(comment.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                            </div>
                            <p className="text-sage-700 font-light leading-relaxed">{comment.content}</p>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a supportive comment or faculty question..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(post.id); }}
                            className="flex-1 text-xs p-2.5 rounded-full bg-sand-50 border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#5F35C5]"
                          />
                          <button onClick={() => handleAddComment(post.id)} className="p-2.5 rounded-full bg-[#5F35C5] text-white hover:bg-[#4d2aa6] transition-colors cursor-pointer">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS DIRECTORY */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-sage-600">Connect with cohort peers, exchange meal prep tips, and high-five accountability partners.</p>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {memberDirectory.length} Active Peers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberDirectory.map((m) => (
                  <div key={m.id} className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#163B8A] to-[#5F35C5] text-white font-serif font-bold text-base flex items-center justify-center">
                            {m.avatar}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-sage-950">{m.name}</h4>
                            <span className="text-[11px] text-sage-500">{m.role} • {m.location}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {m.badge}
                        </span>
                      </div>

                      <p className="text-xs text-sage-700 font-light leading-relaxed">
                        "{m.bio}"
                      </p>

                      <div className="pt-2 border-t border-sand-100 text-[11px] text-[#5F35C5] font-semibold">
                        🎯 Focus: {m.focus}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMemberChat(m);
                        setChatMessage(`Hi ${m.name.split(" ")[0]}! Loved your post in the community feed. How is your 6-week cohort going?`);
                      }}
                      className="w-full py-2 rounded-full bg-[#faf7f2] hover:bg-[#5F35C5] hover:text-white text-[#5F35C5] border border-sand-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Direct Note</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE CHALLENGES */}
          {activeTab === "challenges" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-sage-600">Gamified cohort challenges to build lifelong metabolic and lifestyle habits.</p>
                <span className="text-xs font-bold text-[#5F35C5] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  {joinedChallenges.length} Challenges Enrolled
                </span>
              </div>

              <div className="space-y-4">
                {challengesList.map((ch) => {
                  const isJoined = joinedChallenges.includes(ch.id);
                  return (
                    <div key={ch.id} className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {ch.pillar}
                            </span>
                            <span className="text-xs text-sage-500">• {ch.duration}</span>
                          </div>
                          <h3 className="font-serif text-base font-bold text-sage-950 mt-1">{ch.title}</h3>
                        </div>

                        <button
                          onClick={() => toggleJoinChallenge(ch.id)}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            isJoined
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-[#5F35C5] text-white hover:bg-[#4d2aa6]"
                          }`}
                        >
                          {isJoined ? "✓ Joined Challenge" : "+ Join Challenge"}
                        </button>
                      </div>

                      <p className="text-xs text-sage-700 font-light leading-relaxed">{ch.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-sage-600">
                          <span><strong>Goal:</strong> {ch.goal}</span>
                          <span><strong>{ch.participants}</strong> Members Active</span>
                        </div>

                        <div className="w-full bg-sand-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#5F35C5] to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${ch.progressPercent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-sage-500 pt-1">
                          <span>Progress: {ch.progressPercent}% Target</span>
                          <span className="font-semibold text-amber-700">{ch.rewardBadge}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Challenge Widget 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <span className="text-base">🏃</span>
              <h4>Motion is Medicine Challenge</h4>
            </div>
            <p className="text-xs text-sage-600 leading-relaxed font-light">
              Join 128 members completing 40-minute post-meal brisk walks to naturally stabilize postprandial glucose curves!
            </p>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
              <span>Goal: 5 Walks / Week</span>
              <span className="bg-emerald-200 px-2 py-0.5 rounded-md text-[10px]">Active</span>
            </div>
          </div>

          {/* Clinical Update Widget 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#5F35C5] font-bold text-xs">
              <span className="text-base">📢</span>
              <h4>Faculty Clinical Update</h4>
            </div>
            <p className="text-xs text-sage-600 leading-relaxed font-light">
              Dr. Maya Rao published clinical guidelines on whole-food plant predominant nutrition for metabolic insulin sensitisation.
            </p>
            <button
              onClick={() => setShowProtocolModal(true)}
              className="text-xs font-bold text-[#5F35C5] hover:underline block cursor-pointer"
            >
              Read Faculty Protocol →
            </button>
          </div>

          {/* Active Ambassadors Widget 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4">
            <h4 className="font-serif text-sm font-bold text-sage-900">Top Peer Mentors</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sand-200 font-bold flex items-center justify-center text-sage-900">
                    K
                  </div>
                  <div>
                    <span className="font-bold text-sage-900 block">Kathy Gaither</span>
                    <span className="text-[10px] text-sage-500">6-Week Cohort Veteran</span>
                  </div>
                </div>
                <span className="text-amber-600 font-bold text-[11px]">🔥 42 Days</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sand-200 font-bold flex items-center justify-center text-sage-900">
                    J
                  </div>
                  <div>
                    <span className="font-bold text-sage-900 block">James (Jim) Jones</span>
                    <span className="text-[10px] text-sage-500">Metabolic Champion</span>
                  </div>
                </div>
                <span className="text-amber-600 font-bold text-[11px]">🔥 38 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: SEND MESSAGE TO PEER */}
      {selectedMemberChat && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5F35C5] text-white font-bold flex items-center justify-center text-sm">
                  {selectedMemberChat.avatar}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-sage-950">{selectedMemberChat.name}</h3>
                  <p className="text-xs text-sage-500">{selectedMemberChat.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMemberChat(null)} className="p-2 text-sage-400 hover:text-sage-700">✕</button>
            </div>

            {sentMessageNotice ? (
              <div className="p-8 text-center text-xs font-semibold text-emerald-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{sentMessageNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Your Message / Encouragement</label>
                  <textarea
                    rows={4}
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#5F35C5]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-sand-200">
                  <button
                    type="button"
                    onClick={() => setSelectedMemberChat(null)}
                    className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#5F35C5] text-white text-xs font-semibold hover:bg-[#4d2aa6] flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CLINICAL PROTOCOL DETAILS */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#5F35C5] block">Faculty Clinical Protocol</span>
                <h3 className="font-serif text-xl font-bold text-sage-950">Whole-Food Plant Nutrition for Insulin Sensitisation</h3>
              </div>
              <button onClick={() => setShowProtocolModal(false)} className="p-2 text-sage-400 hover:text-sage-700">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-sage-800 leading-relaxed">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-[#5F35C5] font-semibold space-y-1">
                <p><strong>Primary Author:</strong> Dr. Maya Rao, MD • Lead Lifestyle Medicine Physician</p>
                <p><strong>Clinical Focus:</strong> Intramyocellular Lipid Reduction & Satiety Signaling</p>
              </div>

              <h4 className="font-serif font-bold text-sm text-sage-950">1. Core Mechanisms</h4>
              <p>
                Insulin resistance is primarily driven by the accumulation of intramyocellular lipids (microscopic fat droplets inside muscle and liver cells) that block the GLUT-4 glucose receptor translocation pathway. By minimizing dietary fat intake to &lt; 15% of total calories and relying on unrefined, whole plant carbohydrates (legumes, intact whole grains, tubers, fruits, and greens), cellular insulin receptors regain sensitivity within 14 to 28 days.
              </p>

              <h4 className="font-serif font-bold text-sm text-sage-950">2. The 3-Step Daily Routine</h4>
              <ul className="list-disc pl-5 space-y-1 text-sage-700">
                <li><strong>Green Salad Anchor:</strong> Eat a large raw leafy salad before each lunch and dinner with lemon tahini or balsamic vinegar dressing.</li>
                <li><strong>Intact Grain Swap:</strong> Replace refined white rice and wheat flour with brown basmati, sprouted quinoa, and steel-cut oats.</li>
                <li><strong>40-Min Postprandial Walk:</strong> A moderate brisk walk within 30 minutes of eating utilizes contraction-stimulated glucose uptake independent of insulin.</li>
              </ul>
            </div>

            <div className="p-4 bg-[#faf7f2] border-t border-sand-200 flex justify-end">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#5F35C5] text-white text-xs font-semibold shadow-xs"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
