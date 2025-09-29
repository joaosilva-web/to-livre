// hooks/useErrorModal.ts
"use client";
import { useState } from "react";

export default function useErrorModal() {
  const [error, setError] = useState<string | null>(null);
  const showError = (msg: string) => setError(msg);
  const close = () => setError(null);

  return { error, showError, close };
}
