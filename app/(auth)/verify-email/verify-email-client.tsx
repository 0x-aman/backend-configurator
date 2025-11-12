"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";

export default function VerifyEmailPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const verifyEmail = async (token: string) => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully!"
        );
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(
          data.error ||
            "Failed to verify email. The token may be invalid or expired."
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while verifying your email.");
    }
  };

  useEffect(() => {
    if (token) verifyEmail(token);
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Redirecting you to login page...
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {status === "success" && (
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            )}

            {status === "error" && (
              <>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/register">Back to Registration</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
