"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

// ✅ Utility form section
function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled,
  placeholder,
  note,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  note?: string;
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
      />
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export default function AccountPage() {
  const { data: session, update } = useSession();
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
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    fetching: false,
  });

  const handleChange = (field: keyof typeof profile, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handlePasswordChange = (field: keyof typeof passwords, value: string) =>
    setPasswords((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading((l) => ({ ...l, fetching: true }));
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const { data } = await res.json();
        console.log(data);
        setProfile({
          name: data?.name || "",
          email: data?.email || "",
          companyName: data?.companyName || "",
          phone: data?.phone || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading((l) => ({ ...l, fetching: false }));
      }
    };
    fetchProfile();
  }, []);

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

      if (!res.ok) throw new Error("Failed to update profile");
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

    if (passwords.new !== passwords.confirm)
      return toast.error("New passwords do not match");
    if (passwords.new.length < 8)
      return toast.error("Password must be at least 8 characters");

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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading((l) => ({ ...l, password: false }));
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
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
                  disabled={loading.fetching || loading.profile}
                />
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={profile.email}
                  disabled
                  note="Email cannot be changed"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="companyName"
                  label="Company Name"
                  value={profile.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  disabled={loading.fetching || loading.profile}
                  placeholder="Optional"
                />
                <FormField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={loading.fetching || loading.profile}
                  placeholder="Optional"
                />
              </div>

              <Button type="submit" disabled={loading.profile}>
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

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              />
              <FormField
                id="newPassword"
                label="New Password"
                type="password"
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                disabled={loading.password}
                note="Must be at least 8 characters"
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
              />

              <Button type="submit" disabled={loading.password}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
