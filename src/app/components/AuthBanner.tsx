"use client";

import React from "react";
import Button from "./ui/Button";
import useSession from "@/hooks/useSession";

export default function AuthBanner() {
  const { error, refresh } = useSession();
  if (!error) return null;

  return (
    <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
      <div>
        <p className="font-semibold">Erro de autenticação</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outlined" onClick={() => refresh()}>
          Tentar novamente
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            try {
              const currentPath =
                typeof window !== "undefined" ? window.location.pathname : "/";
              window.location.href = `/auth?next=${encodeURIComponent(
                currentPath
              )}`;
            } catch {
              window.location.href = "/auth";
            }
          }}
        >
          Fazer login
        </Button>
      </div>
    </div>
  );
}
