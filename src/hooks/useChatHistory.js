import { useState, useRef, useEffect, useCallback } from "react";

const LEGACY_KEY = "rei_chat_history_v2";

function readStoredMessages(selectedDomain) {
  if (typeof window === "undefined") return null;
  const storageKey = `rei_chat_history_${selectedDomain}`;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error("Failed to parse saved chat history:", error);
    try {
      window.localStorage.removeItem(storageKey);
    } catch (cleanupError) {
      console.error("Failed to clear corrupted chat history:", cleanupError);
    }
    return null;
  }
}

function buildInitMessage(buildDomainSystemMessage, selectedDomain, domainProfiles) {
  const profile = domainProfiles.find((d) => d.id === selectedDomain) || domainProfiles[0];
  return {
    sender: "rei",
    text: buildDomainSystemMessage(selectedDomain, profile),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export function useChatHistory(selectedDomain, buildDomainSystemMessage, DOMAIN_PROFILES) {
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [assistantPromptIndex, setAssistantPromptIndex] = useState(0);

  const [messages, setMessages] = useState(() => {
    const stored = readStoredMessages(selectedDomain);
    if (stored) return stored;
    return [buildInitMessage(buildDomainSystemMessage, selectedDomain, DOMAIN_PROFILES)];
  });

  // Clear legacy key once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
  }, []);

  // Domain change — reset to domain-specific greeting
  useEffect(() => {
    const initMsg = buildInitMessage(buildDomainSystemMessage, selectedDomain, DOMAIN_PROFILES);
    setMessages([initMsg]);
    if (typeof window !== "undefined") {
      localStorage.setItem(`rei_chat_history_${selectedDomain}`, JSON.stringify([initMsg]));
    }
  }, [selectedDomain]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages.length]);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`rei_chat_history_${selectedDomain}`, JSON.stringify(messages));
    }
  }, [messages, selectedDomain]);

  const handleClearHistory = useCallback(() => {
    const initMsg = buildInitMessage(buildDomainSystemMessage, selectedDomain, DOMAIN_PROFILES);
    setMessages([initMsg]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`rei_chat_history_${selectedDomain}`);
    }
  }, [selectedDomain, buildDomainSystemMessage, DOMAIN_PROFILES]);

  return {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    chatEndRef,
    assistantPromptIndex,
    setAssistantPromptIndex,
    handleClearHistory,
  };
}
