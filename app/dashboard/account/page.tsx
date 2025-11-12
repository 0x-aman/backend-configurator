"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLoading } from "@/components/dashboard-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Shield,
  Link as LinkIcon,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Key,
  Chrome,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientProfile } from "@/src/types/auth";
import type { ApiResponse } from "@/src/types/api";

function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled,
  placeholder,
  note,
  testId,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  note?: string;
  testId?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={disabled ? "bg-muted" : ""}
        data-testid={testId}
      />
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [clientData, setClientData] = useState<ClientProfile | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [newPasswordForOAuth, setNewPasswordForOAuth] = useState({
    password: "",
    confirm: "",
  });
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    addPassword: false,
    linkGoogle: false,
    unlinkGoogle: false,
    fetching: true,
    domains: false,
  });

  // ✅ Use the typed fields from ClientProfile
  const hasPassword = !!clientData?.hasPassword;
  const hasGoogle = !!clientData?.hasGoogleLinked;
  const isOAuthOnly = hasGoogle && !hasPassword;

  const handleChange = (field: keyof typeof profile, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handlePasswordChange = (field: keyof typeof passwords, value: string) =>
    setPasswords((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    fetchProfile();
  }, []);

  // Check URL params after OAuth redirect to show feedback and refresh profile
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("linked") === "true") {
        toast.success("Google account linked successfully!");
        // Remove the query param from the URL so refresh doesn't re-show toast
        const url = new URL(window.location.href);
        url.searchParams.delete("linked");
        window.history.replaceState({}, document.title, url.toString());
        fetchProfile();
        // update session data
        if (update) update();
      }

      if (params.get("unlinked") === "true") {
        toast.success("Google account unlinked successfully!");
        const url = new URL(window.location.href);
        url.searchParams.delete("unlinked");
        window.history.replaceState({}, document.title, url.toString());
        fetchProfile();
        if (update) update();
      }
    } catch (err) {
      // ignore in non-browser environments
    }
  }, [update]);

  const fetchProfile = async () => {
    setLoading((l) => ({ ...l, fetching: true }));
    try {
      // ✅ Use consistent endpoint with proper typing
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const response: ApiResponse<ClientProfile> = await res.json();

      if (response.success && response.data) {
        setClientData(response.data);
        setProfile({
          name: response.data.name || "",
          email: response.data.email || "",
          companyName: response.data.companyName || "",
          phone: response.data.phone || "",
        });
        setDomains(response.data.allowedDomains || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading((l) => ({ ...l, fetching: false }));
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((l) => ({ ...l, profile: true }));

    try {
      const res = await fetch("/api/client/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          companyName: profile.companyName,
          phone: profile.phone,
        }),
      });

      const { success } = await res.json();
      if (!success) throw new Error("Failed to update profile");

      await update({ name: profile.name });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading((l) => ({ ...l, profile: false }));
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match");
    }
    if (passwords.new.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading((l) => ({ ...l, password: true }));

    try {
      const res = await fetch("/api/client/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const { success, error } = await res.json();
      if (!success) throw new Error(error || "Failed to change password");

      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      fetchProfile(); // Refresh to update hasPassword status
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading((l) => ({ ...l, password: false }));
    }
  };

  const addPasswordForOAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPasswordForOAuth.password !== newPasswordForOAuth.confirm) {
      return toast.error("Passwords do not match");
    }
    if (newPasswordForOAuth.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading((l) => ({ ...l, addPassword: true }));

    try {
      const res = await fetch("/api/auth/add-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPasswordForOAuth.password,
        }),
      });

      const { success, error } = await res.json();
      if (!success) throw new Error(error || "Failed to add password");

      toast.success(
        "Password added successfully! You can now login with email and password."
      );
      setNewPasswordForOAuth({ password: "", confirm: "" });
      fetchProfile(); // Refresh to update hasPassword status
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add password");
    } finally {
      setLoading((l) => ({ ...l, addPassword: false }));
    }
  };

  const linkGoogleAccount = async () => {
    setLoading((l) => ({ ...l, linkGoogle: true }));
    try {
      // Trigger Google OAuth flow. Use absolute callbackUrl so NextAuth redirects
      // back to the account page with an explicit flag we can read.
      const callback = `${window.location.origin}/dashboard/account?linked=true`;
      // Use redirect: false so we control navigation and ensure the callbackUrl is respected
      // signIn will return an object containing the provider URL which we can navigate to.
      const res = await signIn("google", {
        callbackUrl: callback,
        redirect: false,
      });
      if (res && typeof res === "object") {
        const redirectUrl = (res as any).url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          // Fallback: navigate to our callback directly
          window.location.href = callback;
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to link Google account");
      setLoading((l) => ({ ...l, linkGoogle: false }));
    }
  };

  const unlinkGoogleAccount = async () => {
    if (!hasPassword) {
      toast.error(
        "Cannot unlink Google account without setting a password first!"
      );
      return;
    }

    setLoading((l) => ({ ...l, unlinkGoogle: true }));

    try {
      const res = await fetch("/api/auth/unlink-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const { success, error } = await res.json();
      if (!success) throw new Error(error || "Failed to unlink Google account");

      toast.success("Google account unlinked successfully!");
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to unlink Google account");
    } finally {
      setLoading((l) => ({ ...l, unlinkGoogle: false }));
    }
  };

  const validateDomain = (domain: string): boolean => {
    if (domain === "localhost") return true;
    // Basic domain validation regex
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  };

  const addDomain = async () => {
    const trimmedDomain = newDomain.trim().toLowerCase();

    if (!trimmedDomain) {
      toast.error("Please enter a domain");
      return;
    }

    if (!validateDomain(trimmedDomain)) {
      toast.error(
        "Please enter a valid domain (e.g., example.com or subdomain.example.com)"
      );
      return;
    }

    if (domains.includes(trimmedDomain)) {
      toast.error("This domain is already in your list");
      return;
    }

    setLoading((l) => ({ ...l, domains: true }));

    try {
      const newDomains = [...domains, trimmedDomain];
      const res = await fetch("/api/client/domains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: newDomains }),
      });

      const { success, error } = await res.json();
      if (!success) throw new Error(error || "Failed to add domain");

      setDomains(newDomains);
      setNewDomain("");
      toast.success("Domain added successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add domain");
    } finally {
      setLoading((l) => ({ ...l, domains: false }));
    }
  };

  const removeDomain = async (domainToRemove: string) => {
    setLoading((l) => ({ ...l, domains: true }));

    try {
      const newDomains = domains.filter((d) => d !== domainToRemove);
      const res = await fetch("/api/client/domains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: newDomains }),
      });

      const { success, error } = await res.json();
      if (!success) throw new Error(error || "Failed to remove domain");

      setDomains(newDomains);
      toast.success("Domain removed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to remove domain");
    } finally {
      setLoading((l) => ({ ...l, domains: false }));
    }
  };

  if (loading.fetching) {
    return <DashboardLoading />;
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="account-settings-title"
        >
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and security settings
        </p>
      </header>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="name"
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={loading.profile}
                  testId="profile-name-input"
                />
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={profile.email}
                  disabled
                  note="Email cannot be changed"
                  testId="profile-email-input"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="companyName"
                  label="Company Name"
                  value={profile.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  disabled={loading.profile}
                  placeholder="Optional"
                  testId="profile-company-input"
                />
                <FormField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={loading.profile}
                  placeholder="Optional"
                  testId="profile-phone-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading.profile}
                data-testid="save-profile-button"
              >
                {loading.profile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security & Authentication Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Login Methods
            </CardTitle>
            <CardDescription>
              Manage how you sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Authentication Status */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Active Login Methods</h3>
              <div className="flex flex-wrap gap-2">
                {hasPassword && (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1"
                    data-testid="auth-method-password"
                  >
                    <Key className="h-3 w-3" />
                    Password Login
                  </Badge>
                )}
                {hasGoogle && (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1"
                    data-testid="auth-method-google"
                  >
                    <Chrome className="h-3 w-3" />
                    Google OAuth
                  </Badge>
                )}
                {!hasPassword && !hasGoogle && (
                  <Badge variant="secondary">
                    No authentication method set
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Google Account Management */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center gap-2">
                    <Chrome className="h-4 w-4" />
                    Google Account
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hasGoogle
                      ? "Your Google account is linked. You can sign in with Google."
                      : "Link your Google account for faster sign-in."}
                  </p>
                </div>
                <div>
                  {hasGoogle ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={unlinkGoogleAccount}
                      disabled={loading.unlinkGoogle || !hasPassword}
                      data-testid="unlink-google-button"
                    >
                      {loading.unlinkGoogle ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Unlink className="mr-2 h-4 w-4" />
                      )}
                      Unlink
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={linkGoogleAccount}
                      disabled={loading.linkGoogle}
                      data-testid="link-google-button"
                    >
                      {loading.linkGoogle ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LinkIcon className="mr-2 h-4 w-4" />
                      )}
                      Link Google
                    </Button>
                  )}
                </div>
              </div>

              {hasGoogle && !hasPassword && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Add a password to enable email/password login and to be able
                    to unlink your Google account.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Password Management */}
            {isOAuthOnly ? (
              // Add Password for OAuth-only users
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Add Password Login
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set a password to enable email/password authentication
                  </p>
                </div>

                <form onSubmit={addPasswordForOAuth} className="space-y-4">
                  <FormField
                    id="newPasswordOAuth"
                    label="New Password"
                    type="password"
                    value={newPasswordForOAuth.password}
                    onChange={(e) =>
                      setNewPasswordForOAuth((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={loading.addPassword}
                    note="Must be at least 8 characters"
                    testId="add-password-input"
                  />
                  <FormField
                    id="confirmPasswordOAuth"
                    label="Confirm Password"
                    type="password"
                    value={newPasswordForOAuth.confirm}
                    onChange={(e) =>
                      setNewPasswordForOAuth((prev) => ({
                        ...prev,
                        confirm: e.target.value,
                      }))
                    }
                    disabled={loading.addPassword}
                    testId="add-password-confirm-input"
                  />

                  <Button
                    type="submit"
                    disabled={loading.addPassword}
                    data-testid="add-password-button"
                  >
                    {loading.addPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Password...
                      </>
                    ) : (
                      "Add Password"
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              // Change Password for users who already have one
              hasPassword && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Change Password
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <form onSubmit={changePassword} className="space-y-4">
                    <FormField
                      id="currentPassword"
                      label="Current Password"
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        handlePasswordChange("current", e.target.value)
                      }
                      disabled={loading.password}
                      testId="current-password-input"
                    />
                    <FormField
                      id="newPassword"
                      label="New Password"
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        handlePasswordChange("new", e.target.value)
                      }
                      disabled={loading.password}
                      note="Must be at least 8 characters"
                      testId="new-password-input"
                    />
                    <FormField
                      id="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        handlePasswordChange("confirm", e.target.value)
                      }
                      disabled={loading.password}
                      testId="confirm-password-input"
                    />

                    <Button
                      type="submit"
                      disabled={loading.password}
                      data-testid="change-password-button"
                    >
                      {loading.password ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Allowed Origins Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Allowed Origins
            </CardTitle>
            <CardDescription>
              Manage domains allowed to access your configurator API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newDomain">Add New Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="newDomain"
                  placeholder="example.com or subdomain.example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDomain();
                    }
                  }}
                  disabled={loading.domains}
                  data-testid="new-domain-input"
                />
                <Button
                  onClick={addDomain}
                  disabled={loading.domains || !newDomain.trim()}
                  data-testid="add-domain-button"
                >
                  {loading.domains ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Only requests from these domains will be able to access your
                configurator via API
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Domains</h3>
              {domains.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No domains added yet. Add domains to restrict API access.
                </p>
              ) : (
                <div className="space-y-2">
                  {domains.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      data-testid={`domain-item-${domain}`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{domain}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDomain(domain)}
                        disabled={loading.domains}
                        data-testid={`remove-domain-${domain}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email Verified</span>
              {clientData?.emailVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">Not Verified</Badge>
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Member Since</span>
              <span>
                {clientData?.createdAt
                  ? new Date(clientData.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            {clientData?.lastLoginAt && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Login</span>
                  <span>
                    {new Date(clientData.lastLoginAt).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
