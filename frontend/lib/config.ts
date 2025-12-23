const getEnv = (key: string, fallback?: string): string => {
  if (typeof window !== "undefined" && (window as any).env?.[key]) {
    return (window as any).env[key];
  }
  return fallback || "";
};

// We explicitly pass process.env.NEXT_PUBLIC_... here.
// Next.js sees this literal string and inlines the value from .env.local
export const API_URL = getEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
export const AGENT_ID_ROUTER = getEnv("NEXT_PUBLIC_AGENT_ID_ROUTER", process.env.NEXT_PUBLIC_AGENT_ID_ROUTER);
export const AGENT_ID_DEBATER = getEnv("NEXT_PUBLIC_AGENT_ID_DEBATER", process.env.NEXT_PUBLIC_AGENT_ID_DEBATER);
export const AGENT_ID_COACH = getEnv("NEXT_PUBLIC_AGENT_ID_COACH", process.env.NEXT_PUBLIC_AGENT_ID_COACH);