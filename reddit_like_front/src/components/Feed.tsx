import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { PostCard } from "./PostCard";
import { TopNews } from "./TopNews";
import { apiClient, PostData, PostSortBy, SortOrder } from "../api/client";
import { useAuth, canDeletePost } from "../contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getPublicSiteUrl } from "../lib/publicSiteUrl";

const formatTimestamp = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks}w ago`;
    }
  } catch {
    return "recently";
  }
};

interface TransformedPost {
  id: string;
  author: string;
  topic: string;
  title: string;
  description: string;
  image: string | undefined;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
}

/** Конвертирует base64 из API в data URL для отображения в <img src>. */
function base64ToDataURL(base64String: string): string | undefined {
  try {
    let cleanBase64 = base64String.trim();
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.split(",")[1] ?? cleanBase64;
    }
    cleanBase64 = cleanBase64.replace(/\s/g, "");

    if (!cleanBase64 || cleanBase64.length < 4) {
      return undefined;
    }

    let binaryString: string;
    try {
      binaryString = atob(cleanBase64);
    } catch {
      return undefined;
    }

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    if (bytes.length === 0) return undefined;

    let mimeType = "image/jpeg";
    if (bytes.length >= 4) {
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        mimeType = "image/png";
      } else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        mimeType = "image/jpeg";
      } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
        mimeType = "image/gif";
      } else if (
        bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      ) {
        mimeType = "image/webp";
      }
    }

    return `data:${mimeType};base64,${cleanBase64}`;
  } catch {
    return undefined;
  }
}

const transformPostData = (post: PostData): TransformedPost => {
  let imageUrl: string | undefined = undefined;
  if (post.media != null && typeof post.media === "string" && post.media.trim().length > 0) {
    imageUrl = base64ToDataURL(post.media);
  }
  return {
    id: post.post_id || "",
    author: post.author_name || "",
    topic: post.thread_name || "",
    title: post.title || "",
    description: post.content || "",
    image: imageUrl,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: 0,
    timestamp: formatTimestamp(post.created_at || new Date().toISOString()),
  };
};

interface FeedProps {
  refreshTrigger?: number;
  onRefresh?: () => Promise<void>;
}

export function Feed({ refreshTrigger = 0, onRefresh }: FeedProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [transformedPosts, setTransformedPosts] = useState<TransformedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canDelete = canDeletePost(user?.role);

  const [searchQuery, setSearchQuery] = useState("");
  const [threadFilter, setThreadFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [hasMediaFilter, setHasMediaFilter] = useState<"all" | "with" | "without">("all");
  const [sortBy, setSortBy] = useState<PostSortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const offset = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const readFiltersFromUrl = useCallback(() => {
    const q = searchParams.get("q") ?? "";
    const thread = searchParams.get("thread") ?? "";
    const author = searchParams.get("author") ?? "";
    const hasMedia = (searchParams.get("has_media") ?? "all") as "all" | "with" | "without";
    const sort_by = (searchParams.get("sort_by") ?? "created_at") as PostSortBy;
    const sort_order = (searchParams.get("sort_order") ?? "desc") as SortOrder;
    const limitRaw = Number(searchParams.get("limit") ?? "10");
    const pageRaw = Number(searchParams.get("page") ?? "1");

    setSearchQuery(q);
    setThreadFilter(thread);
    setAuthorFilter(author);
    setHasMediaFilter(hasMedia === "with" || hasMedia === "without" ? hasMedia : "all");
    setSortBy(sort_by === "likes" || sort_by === "comments" || sort_by === "created_at" ? sort_by : "created_at");
    setSortOrder(sort_order === "asc" || sort_order === "desc" ? sort_order : "desc");
    setPageSize(Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(100, limitRaw) : 10);
    setPage(Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1);
  }, [searchParams]);

  const writeFiltersToUrl = (next: {
    q: string;
    thread: string;
    author: string;
    has_media: "all" | "with" | "without";
    sort_by: PostSortBy;
    sort_order: SortOrder;
    limit: number;
    page: number;
  }) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        const setOrDelete = (key: string, value: string) => {
          if (!value) params.delete(key);
          else params.set(key, value);
        };
        setOrDelete("q", next.q.trim());
        setOrDelete("thread", next.thread.trim());
        setOrDelete("author", next.author.trim());
        if (next.has_media === "all") params.delete("has_media");
        else params.set("has_media", next.has_media);
        params.set("sort_by", next.sort_by);
        params.set("sort_order", next.sort_order);
        params.set("limit", String(next.limit));
        params.set("page", String(next.page));
        return params;
      },
      { replace: true }
    );
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPosts({
        limit: pageSize,
        offset,
        q: searchQuery.trim() ? searchQuery.trim() : undefined,
        thread: threadFilter.trim() ? threadFilter.trim() : undefined,
        author: authorFilter.trim() ? authorFilter.trim() : undefined,
        has_media:
          hasMediaFilter === "with" ? true : hasMediaFilter === "without" ? false : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setPosts(response.posts);
      setTotal(response.total);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load posts");
      } else {
        setError("Failed to load posts. Please check if the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    readFiltersFromUrl();
  }, [refreshTrigger, readFiltersFromUrl]);

  useEffect(() => {
    // keep URL in sync so filters survive navigation
    writeFiltersToUrl({
      q: searchQuery,
      thread: threadFilter,
      author: authorFilter,
      has_media: hasMediaFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
      limit: pageSize,
      page,
    });
  }, [searchQuery, threadFilter, authorFilter, hasMediaFilter, sortBy, sortOrder, pageSize, page, setSearchParams]);

  useEffect(() => {
    // clamp page when total changes or pageSize changes
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger, searchQuery, threadFilter, authorFilter, hasMediaFilter, sortBy, sortOrder, pageSize, offset]);

  useEffect(() => {
    if (posts.length === 0) {
      setTransformedPosts([]);
      return;
    }
    const transformed = posts.map((post) => transformPostData(post));
    setTransformedPosts(transformed);
  }, [posts]);

  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Reddit-like",
    url: siteUrl,
    description: "Public feed of posts — search, filter, and browse threads.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Helmet>
        <title>Home — Reddit-like feed</title>
        <meta
          name="description"
          content="Browse posts, filter by thread and author, search content, and read top technology headlines."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Home — Reddit-like feed" />
        <meta
          property="og:description"
          content="Browse posts and top technology headlines in one place."
        />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="mb-6">
        <h1>Home Feed</h1>
        <p className="text-muted-foreground">Your personalized feed of the latest posts</p>
      </div>

      <TopNews />

      {error && (
        <div className="mb-6 rounded-md border border-border bg-card p-4">
          <p className="text-destructive">Error: {error}</p>
        </div>
      )}

      <form
        className="mb-6 rounded-md border border-border bg-card p-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          fetchPosts();
        }}
      >
        <div className="space-y-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or content"
            className="bg-input-background border-border"
            aria-label="Search posts"
          />
        </div>

        <div className="space-y-2">
          <Input
            value={threadFilter}
            onChange={(e) => setThreadFilter(e.target.value)}
            placeholder="Filter by thread"
            className="bg-input-background border-border"
            aria-label="Filter by thread"
          />
        </div>

        <div className="space-y-2">
          <Input
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            placeholder="Filter by author"
            className="bg-input-background border-border"
            aria-label="Filter by author"
          />
        </div>

        <div className="space-y-2">
          <Select value={hasMediaFilter} onValueChange={(v: "all" | "with" | "without") => setHasMediaFilter(v)}>
            <SelectTrigger className="bg-input-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#ffffff", color: "#000000" }}>
              <SelectItem value="all">All posts</SelectItem>
              <SelectItem value="with">With media</SelectItem>
              <SelectItem value="without">Without media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select value={`${sortBy}:${sortOrder}`} onValueChange={(v: string) => {
            const [sb, so] = v.split(":");
            if (sb === "created_at" || sb === "likes" || sb === "comments") setSortBy(sb);
            if (so === "asc" || so === "desc") setSortOrder(so);
          }}>
            <SelectTrigger className="bg-input-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#ffffff", color: "#000000" }}>
              <SelectItem value="created_at:desc">Newest</SelectItem>
              <SelectItem value="created_at:asc">Oldest</SelectItem>
              <SelectItem value="likes:desc">Most liked</SelectItem>
              <SelectItem value="comments:desc">Most commented</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select value={String(pageSize)} onValueChange={(v: string) => {
            const next = Number(v);
            if (!Number.isFinite(next) || next <= 0) return;
            setPageSize(next);
            setPage(1);
          }}>
            <SelectTrigger className="bg-input-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#ffffff", color: "#000000" }}>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-primary text-primary-foreground">
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setThreadFilter("");
              setAuthorFilter("");
              setHasMediaFilter("all");
              setSortBy("created_at");
              setSortOrder("desc");
              setPageSize(10);
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      <div className="mb-6 flex items-center justify-between gap-2">
        <p className="text-muted-foreground">
          Showing {Math.min(total, offset + 1)}-{Math.min(total, offset + posts.length)} of {total}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : transformedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts available</p>
          </div>
        ) : (
          transformedPosts.map((transformedPost) => (
            <PostCard
              key={transformedPost.id}
              id={transformedPost.id}
              author={transformedPost.author}
              topic={transformedPost.topic}
              title={transformedPost.title}
              description={transformedPost.description}
              image={transformedPost.image}
              likes={transformedPost.likes}
              comments={transformedPost.comments}
              shares={transformedPost.shares}
              timestamp={transformedPost.timestamp}
              canDelete={canDelete}
              onDelete={async () => {
                try {
                  await apiClient.deletePost(transformedPost.id);
                  await fetchPosts();
                  onRefresh?.();
                } catch {
                  // error could be shown via toast
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
