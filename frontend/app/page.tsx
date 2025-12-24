"use client";

import styles from './home.module.css';
import HistoryOverlay from './components/HistoryOverlay';
import HelpModal from './components/HelpModal';
import { useConversation } from '@11labs/react';
import { useCallback, useState, useEffect, useRef } from 'react';

import { AGENT_ID_ROUTER, AGENT_ID_DEBATER, AGENT_ID_COACH, API_URL } from '../lib/config';

const AGENTS = {
  router: AGENT_ID_ROUTER,
  debate: AGENT_ID_DEBATER,
  coach: AGENT_ID_COACH,
};

export default function Home() {
  const [activeAgentId, setActiveAgentId] = useState(AGENTS.router);
  const [statusMessage, setStatusMessage] = useState("Tap to Initialize");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // NEW: Auto-open Help on Load
  useEffect(() => {
    setIsHelpOpen(true);
  }, []); // Empty dependency array = runs once on mount
  
  // THE STENOGRAPHER: Keep a running log of who said what
  const transcriptRef = useRef<{ role: string; content: string }[]>([]);

  // Ref to Hold the "Hanoff" data
  const handoffRef = useRef<{ topic: string; context: string } | null>(null);

  // Ref to track connection
  const isConnecting = useRef(false);

  // Helper: Flush transcript to backend
  const saveSessionToBackend = async (type: string) => {
    const sessionData = transcriptRef.current;
    if (sessionData.length === 0) return; // Don't save empty sessions

    console.log(`Saving ${type} session...`, sessionData);
    
    try {
      await fetch(`${API_URL}/api/save-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: type, // 'scribe', 'debate', or 'coach'
          dialogue: sessionData,
          user_id: "user_123"
        })
      });
      // Clear transcript after save
      transcriptRef.current = [];
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  // TOOL 1: Change Mode (Debate/Coach -> Router)
  const handleChangeMode = async ({ mode, topic }: { mode: string, topic?: string }) => {
    await conversation.endSession();

    let retrievedContext = "";
    // Save the topic if it exists
    // If we are leaving a specialist mode, SAVE the session first
    if (activeAgentId === AGENTS.debate) await saveSessionToBackend("debate");
    if (activeAgentId === AGENTS.coach) await saveSessionToBackend("coach");

    // Normal switch logic...
    let targetMode = mode.toLowerCase();
    if (targetMode.includes("scribe") || targetMode.includes("back")) targetMode = "router";
    
    const newAgentId = AGENTS[targetMode as keyof typeof AGENTS];
    if (!newAgentId) return ;

    if (topic && topic.trim() !== "") {
      console.log(`Pre-fetching memory for: ${topic}`);
      setStatusMessage(`Searching memory for ${topic}...`);
      
      try {
        const res = await fetch(`${API_URL}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: topic, user_id: "user_123", limit: 1 })
        });
        const data = await res.json();
        
        if (data.matches && data.matches.length > 0) {
          retrievedContext = data.matches[0].markdown; // The saved summary
          console.log("Memory found:", retrievedContext.substring(0, 50) + "...");
        } else {
          retrievedContext = "No prior notes found. Start fresh.";
        }
      } catch (e) {
        console.error("Search failed during switch", e);
      }
      
      // Store it for the next agent
      handoffRef.current = {
        topic: topic,
        context: retrievedContext 
      };
    }

    setActiveAgentId(newAgentId);
    return "";
  };

  // TOOL 2: End Session (Router Specific)
  const handleEndSession = async () => {
    // 1. Identify which mode we are ending to tag the data correctly
    let currentType = "scribe";
    if (activeAgentId === AGENTS.debate) currentType = "debate";
    if (activeAgentId === AGENTS.coach) currentType = "coach";

    console.log(`Ending session for: ${currentType}`);
    setStatusMessage("Saving & Resetting...");

    // 2. Save Data (If meaningful)
    if (transcriptRef.current.length > 0) {
      await saveSessionToBackend(currentType);
    }

    // 3. RESET TO ROUTER (This prevents the auto-reconnect loop)
    // The useEffect only auto-connects if activeAgentId !== router.
    // By setting this to router, we tell the app: "We are back home."
    setActiveAgentId(AGENTS.router);

    // 4. Kill the connection
    await conversation.endSession();
    
    setStatusMessage("Tap to Initialize");
  };

  // TOOL 3: Search Memory (The Agent's "Google")
  const handleSearch = async ({ query }: { query: string }) => {
    console.log(`Agent is searching for: ${query}`);
    setStatusMessage("Searching Memory...");

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          user_id: "user_123",
          limit: 1 // We only need the top result for context
        })
      });

      const data = await response.json();
      
      // If we found something, give it to the Agent
      if (data.matches && data.matches.length > 0) {
        const topMatch = data.matches[0];
        console.log("Found:", topMatch.markdown);
        return `Found a relevant past session from ${topMatch.created_at}. Here is the summary: ${topMatch.markdown}`;
      } else {
        return "No relevant past notes found on that topic.";
      }

    } catch (error) {
      console.error("Search error:", error);
      return "I failed to access memory.";
    } finally {
      setStatusMessage("Listening..."); // Reset status
    }
  };

  // TOOL 4: Open History
  const handleOpenHistory = async () => {
    setIsHistoryOpen(true);
    return "Opening your history vault.";
  };

  const conversation = useConversation({
    onConnect: async () => {
      setStatusMessage("Speaking and Listening...");
      transcriptRef.current = []; // Reset transcript on new connection
    },
    onDisconnect: () => setStatusMessage("Tap to Initialize"),
    // RECORDING LOGIC:
    onMessage: (message) => {
      // message has { source: 'user' | 'ai', message: '...' }
      // We map 'ai' to 'assistant' for standard LLM format
      const role = message.source === 'ai' ? 'assistant' : 'user';
      transcriptRef.current.push({ role, content: message.message });
      console.log("Logged:", role, message.message);
    },
    clientTools: {
      change_mode: handleChangeMode,
      end_session: handleEndSession,
      search_memory: handleSearch,
      open_history: handleOpenHistory 
    }
  });

  // 4. Auto-Connect Effect (When Agent ID changes)
  // This waits for the state to update, then dials the new agent
  useEffect(() => {
    if (isConnecting.current) return;

    // Only auto-connect if we just switched (and aren't already connected)
    const switchAgent = async () => {
      if (activeAgentId !== AGENTS.router && conversation.status === 'disconnected') {
        // LOCK THE GUARD
        isConnecting.current = true;

        try {
          const handoffData = handoffRef.current;
          console.log("Connecting with Handoff:", handoffData);
          setStatusMessage("Connecting to specialist..."); // Visual feedback

          await conversation.startSession({ 
            agentId: activeAgentId, 
            dynamicVariables: {
                topic: handoffData?.topic || "General",
                user_context: handoffData?.context || ""
              } 
            } as any);

        } catch (e) {
          console.error("Failed to switch agent", e);
          // Unlock on error so we can try again
          isConnecting.current = false;
        }
      }
    };

    
    switchAgent()

    return () => {
      isConnecting.current = false; 
    };

  }, [activeAgentId]); // Runs whenever activeAgentId changes

  const toggleSession = useCallback(async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession();
      // Reset to Router on disconnect if you want? 
      // Or stay on current agent. Let's stay for now.
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({ agentId: activeAgentId } as any);
      } catch (err) {
        alert("Microphone access required.");
      }
    }
  }, [conversation, activeAgentId]);

  const isActive = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  return (
    <main className={styles.container}>
      <HistoryOverlay 
         isOpen={isHistoryOpen} 
         onClose={() => setIsHistoryOpen(false)} 
       />
       <HelpModal 
         isOpen={isHelpOpen} 
         onClose={() => setIsHelpOpen(false)} 
       />
      <header className={styles.header}>
        <div className={styles.logoGroup}>
            <div className={styles.logo}>Nexus</div>
            
            <button 
                className={styles.helpBtn} 
                onClick={() => setIsHelpOpen(true)}
                title="Open User Manual"
            >
                ?
            </button>
        </div>
        
        {/* Right side container */}
        <div className={styles.headerRight}>
          
          {/* 1. The Mode Badge */}
          <div className={styles.modeBadge}>
             {activeAgentId === AGENTS.router ? "Scribe" :
              activeAgentId === AGENTS.debate ? "Debate" : "Coach"}
          </div>

          {/* 2. The History Button (Restored) */}
          <button className={styles.menuBtn}
          onClick={() => setIsHistoryOpen(true)}
          >
            History
          </button>
          
        </div>
      </header>

      <div 
        className={styles.orb} 
        onClick={toggleSession}
        style={{
          background: isSpeaking ? 'radial-gradient(circle, #ffffff, #e5e5e5)' 
            : isActive ? 'radial-gradient(circle, #f87171, #ef4444)' 
            : undefined,
          boxShadow: isSpeaking ? '0 0 80px rgba(255, 255, 255, 0.8)'
            : isActive ? '0 0 60px rgba(239, 68, 68, 0.6)' 
            : undefined,
          transform: isSpeaking ? 'scale(1.1)' : 'scale(1)'
        }}
      ></div>

      <p className={styles.status}>{statusMessage}</p>
    </main>
  );
}