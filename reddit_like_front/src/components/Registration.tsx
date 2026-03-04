import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { useState } from "react";
import { apiClient, ApiError } from "../api/client";

interface RegistrationProps {
  onSwitchToLogin?: () => void;
  onRegistrationSuccess?: () => void;
}

type Step = "form" | "verify";

export function Registration({ onSwitchToLogin, onRegistrationSuccess }: RegistrationProps) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [step, setStep] = useState<Step>("form");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await apiClient.registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        repeat_password: formData.confirmPassword,
      });
      setStep("verify");
      setCodeSent(false);
      setVerifyCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await apiClient.sendVerifyCode({ email: formData.email });
      setCodeSent(true);
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
    if (Number.isNaN(code)) {
      setError("Enter a valid 6-digit code");
      return;
    }
    try {
      setLoading(true);
      await apiClient.confirmVerifyCode({ code });
      onRegistrationSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
        <Card className="w-full max-w-md border border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">Confirm your email</CardTitle>
            <CardDescription className="text-center">
              {codeSent
                ? "Enter the 6-digit code we sent to your email"
                : `We'll send a verification code to ${formData.email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-email">Email</Label>
                  <Input
                    id="verify-email"
                    type="email"
                    className="bg-input-background border-border"
                    value={formData.email}
                    readOnly
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send verification code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmCode} className="space-y-4">
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
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading || verifyCode.length < 6}
                >
                  {loading ? "Confirming..." : "Confirm"}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:underline"
                  onClick={() => setCodeSent(false)}
                >
                  Send code again
                </button>
              </form>
            )}
            <div className="text-center text-muted-foreground mt-4">
              Already have an account?{" "}
              <button
                type="button"
                className="text-foreground hover:underline cursor-pointer"
                onClick={() => onSwitchToLogin?.()}
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <Card className="w-full max-w-md border border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join our community and start sharing your ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-input-background border-border"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                className="bg-input-background border-border"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-input-background border-border"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="bg-input-background border-border"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeToTerms: checked as boolean })
                }
              />
              <label
                htmlFor="terms"
                className="text-muted-foreground cursor-pointer"
              >
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={!formData.agreeToTerms || loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-foreground hover:underline cursor-pointer"
                onClick={() => onSwitchToLogin?.()}
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
