import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const UserWidget: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div className="flex gap-3">
      {session ? (
        <Link href="/dashboard">
          <Button size="sm" data-testid="nav-dashboard-button">
            Dashboard
          </Button>
        </Link>
      ) : (
        <>
          <Link href="/login">
            <Button variant="ghost" size="sm" data-testid="nav-login-button">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" data-testid="nav-signup-button">
              Get Started
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default UserWidget;
