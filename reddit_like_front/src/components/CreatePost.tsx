import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { apiClient, ApiError } from "../api/client";
import { Alert, AlertDescription } from "./ui/alert";

interface CreatePostProps {
  onPostCreated?: () => void;
  onCancel?: () => void;
}

export function CreatePost({ onPostCreated, onCancel }: CreatePostProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    thread: "",
    title: "",
    content: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById("media") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!formData.thread.trim()) throw new Error("Thread name is required");
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.content.trim()) throw new Error("Content is required");

      let mediaBase64: string | undefined;
      if (selectedFile) {
        mediaBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      await apiClient.createPost({
        thread: formData.thread.trim(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        media: mediaBase64,
      });

      setSuccessMessage("Post created successfully!");
      setFormData({ thread: "", title: "", content: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      const fileInput = document.getElementById("media") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      if (onPostCreated) {
        setTimeout(() => onPostCreated(), 1500);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create post");
      } else if (err instanceof Error) {
        setError(err.message || "Failed to create post");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1>Create Post</h1>
        <p className="text-muted-foreground">Share your thoughts with the community</p>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>New Post</CardTitle>
          <CardDescription>Fill in the details below to create your post</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="thread">Thread Name *</Label>
              <Input
                id="thread"
                name="thread"
                type="text"
                placeholder="e.g., programming, gaming, news"
                value={formData.thread}
                onChange={handleInputChange}
                className="bg-input-background border-border"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter post title"
                value={formData.title}
                onChange={handleInputChange}
                className="bg-input-background border-border"
                required
                maxLength={200}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your post content here..."
                value={formData.content}
                onChange={handleInputChange}
                className="bg-input-background border-border resize-none"
                rows={8}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media">Image (Optional)</Label>
              <Input
                id="media"
                name="media"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-input-background border-border"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">JPG, PNG, GIF, WebP. Max size 10MB</p>
              {previewUrl && (
                <div className="mt-4 relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded-md border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Post"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
