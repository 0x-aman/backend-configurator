"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);

      // Auto sign in after registration
      setTimeout(async () => {
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Create an account
            </h1>
            <p className="text-base text-muted-foreground">
              Get started with your free trial
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
                Account created! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-foreground"
              >
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || success}
                className="h-11 bg-muted/50 border-border focus:bg-background"
              />
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-foreground"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || success}
                className="h-11 bg-muted/50 border-border focus:bg-background"
              />
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || success}
                minLength={8}
                className="h-11 bg-muted/50 border-border focus:bg-background"
              />
              <p className="text-xs text-muted-foreground font-medium">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-foreground"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || success}
                minLength={8}
                className="h-11 bg-muted/50 border-border focus:bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-8 font-semibold"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Success!
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            disabled={loading || success}
            onClick={handleGoogleSignUp}
            className="w-full h-11 font-medium bg-transparent"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>

          <p className="text-sm text-center text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Product Showcase */}
      <ProductShowcase />
    </div>
  );
}
