"use client";

import { useSessionContext } from "@/context/SessionProvider";

export default function useSession() {
  return useSessionContext();
}
