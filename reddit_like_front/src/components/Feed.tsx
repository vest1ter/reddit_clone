import React, { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { apiClient, PostData } from "../api/client";
import { useAuth, canDeletePost } from "../contexts/AuthContext";

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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [transformedPosts, setTransformedPosts] = useState<TransformedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canDelete = canDeletePost(user?.role);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPosts(10, 0);
      setPosts(response.posts);
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
    fetchPosts();
  }, [refreshTrigger]);

  useEffect(() => {
    if (posts.length === 0) {
      setTransformedPosts([]);
      return;
    }
    const transformed = posts.map((post) => transformPostData(post));
    setTransformedPosts(transformed);
  }, [posts]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1>Home Feed</h1>
          <p className="text-muted-foreground">Your personalized feed of the latest posts</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1>Home Feed</h1>
          <p className="text-muted-foreground">Your personalized feed of the latest posts</p>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1>Home Feed</h1>
        <p className="text-muted-foreground">Your personalized feed of the latest posts</p>
      </div>
      <div>
        {transformedPosts.length === 0 && !loading ? (
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
