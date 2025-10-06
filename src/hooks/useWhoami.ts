// Deprecated: useSession (SessionProvider) replaced useWhoami across the app.
export default function useWhoami() {
  throw new Error(
    "useWhoami is deprecated - use useSession() from '@/hooks/useSession' instead."
  );
}
