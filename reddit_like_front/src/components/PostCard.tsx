import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MessageCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Share2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

interface PostCardProps {
  id: string;
  author: string;
  authorAvatar?: string;
  topic: string;
  title: string;
  description: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  canDelete?: boolean;
  onDelete?: () => void | Promise<void>;
}

const Trash = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V7a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export function PostCard({
  author,
  authorAvatar,
  topic,
  title,
  description,
  image,
  likes,
  comments,
  shares,
  timestamp,
  canDelete,
  onDelete,
}: PostCardProps) {
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <Card className="mb-4 border border-border bg-card overflow-hidden hover:border-muted-foreground/20 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {author && author.length > 0 ? author.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted/80">
                r/{topic}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Posted by u/{author}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <h3 className="mb-2">{title}</h3>
          <p className="text-foreground/80">{description}</p>
        </div>

        {/* Image */}
        {image && (
          <div className="mb-3 rounded-md overflow-hidden bg-muted">
            <ImageWithFallback
              src={image}
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 hover:bg-muted ${
              isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-muted">
            <MessageCircle className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-muted">
            <Share2 className="h-4 w-4" />
            <span>{shares}</span>
          </Button>
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await onDelete();
                } finally {
                  setDeleting(false);
                }
              }}
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
