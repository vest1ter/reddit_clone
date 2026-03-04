import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { apiClient, ApiError } from "../api/client";
import { Alert, AlertDescription } from "./ui/alert";

export function AdminRoles() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"user" | "moderator" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!userId.trim()) {
      setMessage({ type: "error", text: "Enter user ID" });
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.setUserRole({ user_id: userId.trim(), role });
      setMessage({ type: res.success ? "success" : "error", text: res.message });
      if (res.success) setUserId("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof ApiError ? err.message : "Failed to set role",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Manage user roles</CardTitle>
          <CardDescription>Change a user&apos;s role (admin only). User ID is the UUID from the database.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-4">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID (UUID)</Label>
              <Input
                id="user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="bg-input-background border-border"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v: "user" | "moderator" | "admin") => setRole(v)}>
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  side="top"
                  sideOffset={6}
                  collisionPadding={8}
                  className="z-[100]"
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                >
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="moderator">moderator</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
              {loading ? "Saving..." : "Set role"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
