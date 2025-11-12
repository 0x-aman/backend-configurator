"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ProductShowcase } from "../product-showcase";

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Reset password
            </h1>
            <p className="text-base text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Password reset successful! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || success || !token}
                minLength={8}
                className="h-11 bg-muted/50 border-border focus:bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-foreground"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || success || !token}
                minLength={8}
                className="h-11 bg-muted/50 border-border focus:bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-8 font-semibold"
              disabled={loading || success || !token}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Success!
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Product Showcase */}
      <ProductShowcase />
    </div>
  );
}
