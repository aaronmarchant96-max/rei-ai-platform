import { useState, useCallback } from "react";

export function useSessionTracker() {
  const [sessionTokens, setSessionTokens] = useState(0);
  const [sessionMessages, setSessionMessages] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [modelBreakdown, setModelBreakdown] = useState({});
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [savingsVsPremium, setSavingsVsPremium] = useState(0);
  const [escalationCount, setEscalationCount] = useState(0);

  const trackMessage = useCallback((totalTokens, model, cost, premiumCost, wasEscalated) => {
    setSessionTokens((prev) => prev + totalTokens);
    setSessionMessages((prev) => prev + 1);
    setSessionCost((prev) => prev + cost);
    setModelBreakdown((prev) => ({
      ...prev,
      [model]: (prev[model] || 0) + totalTokens,
    }));
    if (premiumCost) {
      setSavingsVsPremium((prev) => prev + (premiumCost - cost));
    }
    if (wasEscalated) {
      setEscalationCount((prev) => prev + 1);
    }
  }, []);

  const resetSession = useCallback(() => {
    setSessionTokens(0);
    setSessionMessages(0);
    setSessionCost(0);
    setModelBreakdown({});
    setShowSessionSummary(false);
    setSavingsVsPremium(0);
    setEscalationCount(0);
  }, []);

  return {
    sessionTokens,
    sessionMessages,
    sessionCost,
    modelBreakdown,
    showSessionSummary,
    setShowSessionSummary,
    savingsVsPremium,
    escalationCount,
    trackMessage,
    resetSession,
  };
}
