import { useState, useCallback } from "react";

export function useSessionTracker() {
  const [sessionTokens, setSessionTokens] = useState(0);
  const [sessionMessages, setSessionMessages] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [modelBreakdown, setModelBreakdown] = useState({});
  const [showSessionSummary, setShowSessionSummary] = useState(false);

  const trackMessage = useCallback((totalTokens, model, cost) => {
    setSessionTokens((prev) => prev + totalTokens);
    setSessionMessages((prev) => prev + 1);
    setSessionCost((prev) => prev + cost);
    setModelBreakdown((prev) => ({
      ...prev,
      [model]: (prev[model] || 0) + totalTokens,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSessionTokens(0);
    setSessionMessages(0);
    setSessionCost(0);
    setModelBreakdown({});
    setShowSessionSummary(false);
  }, []);

  return {
    sessionTokens,
    sessionMessages,
    sessionCost,
    modelBreakdown,
    showSessionSummary,
    setShowSessionSummary,
    trackMessage,
    resetSession,
  };
}
