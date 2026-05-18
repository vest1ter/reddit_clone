import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { apiClient, ApiError } from "../api/client";
import { Alert, AlertDescription } from "./ui/alert";

interface LoginProps {
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
  onRequireEmailVerification?: () => void;
}

export function Login({ onSwitchToRegister, onLoginSuccess, onRequireEmailVerification }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!loginData.username.trim() || !loginData.password) {
      setError("Username and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.loginUser({
        username: loginData.username,
        password: loginData.password,
      });

      if (response.confirmed) {
        setSuccessMessage(response.message || "Login successful!");
        setTimeout(() => {
          onLoginSuccess?.();
        }, 1000);
        return;
      }

      if (onRequireEmailVerification) {
        onRequireEmailVerification();
        return;
      }

      setError(response.message || "Please verify your email to complete login.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Login failed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <Card className="w-full max-w-md border border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="username"
                className="bg-input-background border-border"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="bg-input-background border-border"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-foreground hover:underline cursor-pointer focus:outline-none focus:underline"
                onClick={() => onSwitchToRegister?.()}
              >
                Create Account
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
