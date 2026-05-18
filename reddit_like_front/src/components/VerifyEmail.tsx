import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { apiClient, ApiError } from "../api/client";

type Step = "send" | "confirm";

interface VerifyEmailProps {
  initialEmail?: string;
  onVerified?: () => void;
  onBackToLogin?: () => void;
  onBackToRegister?: () => void;
}

export function VerifyEmail({
  initialEmail = "",
  onVerified,
  onBackToLogin,
  onBackToRegister,
}: VerifyEmailProps) {
  const [step, setStep] = useState<Step>("send");
  const [email, setEmail] = useState(initialEmail);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim(), [email]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!normalizedEmail) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      await apiClient.sendVerifyCode({ email: normalizedEmail });
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = parseInt(verifyCode, 10);
    if (!normalizedEmail) {
      setError("Email is required");
      return;
    }
    if (Number.isNaN(code) || verifyCode.length < 6) {
      setError("Enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.confirmVerifyCode({ code });
      if (!res.confirmed) {
        setError(res.message || "Invalid or expired code");
        return;
      }
      onVerified?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <Card className="w-full max-w-md border border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Confirm your email</CardTitle>
          <CardDescription className="text-center">
            {step === "send"
              ? "We will send a 6-digit verification code to your email"
              : "Enter the 6-digit code we sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "send" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-email">Email</Label>
                <Input
                  id="verify-email"
                  type="email"
                  className="bg-input-background border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || !normalizedEmail}
              >
                {loading ? "Sending..." : "Send verification code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-email-confirm">Email</Label>
                <Input
                  id="verify-email-confirm"
                  type="email"
                  className="bg-input-background border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  className="bg-input-background border-border"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || verifyCode.length < 6 || !normalizedEmail}
              >
                {loading ? "Confirming..." : "Confirm"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:underline"
                onClick={() => {
                  setStep("send");
                  setVerifyCode("");
                }}
                aria-label="Send code again"
              >
                Send code again
              </button>
            </form>
          )}

          <div className="mt-4 space-y-2 text-center text-muted-foreground">
            <button
              type="button"
              className="w-full text-sm text-foreground hover:underline"
              onClick={onBackToLogin}
              aria-label="Back to login"
            >
              Back to Sign In
            </button>
            <button
              type="button"
              className="w-full text-sm text-foreground hover:underline"
              onClick={onBackToRegister}
              aria-label="Back to register"
            >
              Back to Register
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

