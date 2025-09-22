// app/dashboard/DashboardLogoutButton.tsx
"use client";

import Button from "@/app/components/ui/Button";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function DashboardLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth"; // redireciona após limpar cookie
  };

  return (
    <Button onClick={handleLogout} disabled={loading} size="sm">
      {loading ? (
        "Saindo..."
      ) : (
        <span className="flex gap-1 justify-center items-center">
          <LogOut />
          Logout
        </span>
      )}
    </Button>
  );
}
