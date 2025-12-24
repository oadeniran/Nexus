// app/components/HistoryOverlay.tsx
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './HistoryOverlay.module.css';

import { API_URL } from '../../lib/config';

interface Session {
  id: string;
  type: string;
  title?: string; // Optional if older docs don't have it
  short_description?: string;
  created_at: string;
  formatted_markdown: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function HistoryOverlay({ isOpen, onClose, userId }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch history when opened
  useEffect(() => {
    if (isOpen && userId) {
      // 2. START LOADING
      setIsLoading(true);
      
      fetch(`${API_URL}/api/history?user_id=${userId}`)
        .then(res => res.json())
        .then(data => setSessions(data.history))
        .catch(err => console.error("Failed to load history", err))
        .finally(() => {
          // 3. STOP LOADING (Runs whether success or fail)
          setIsLoading(false);
        });
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.overlayHeader}>
        <h2 className={styles.overlayTitle}>Memory Vault</h2>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.scrollContainer}>
        {isLoading ? (
          // A. LOADING STATE
          <div className={styles.loadingContainer}>
            <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></span>
            <p>Accessing Neural Archives...</p>
          </div>
          ) : sessions.length === 0 ? (
            // B. EMPTY STATE (Optional polish)
            <div className={styles.loadingContainer}>
              <p>No memories found. Start a conversation to scribe your first idea.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {sessions.map((session) => {
                const isExpanded = expandedId === session.id;
                return (
                  <div 
                    key={session.id} 
                    className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
                    onClick={() => !isExpanded && setExpandedId(session.id)}
                    style={{ cursor: isExpanded ? 'default' : 'pointer' }}
                  >
                    
                    {/* 1. HEADER (Always Visible) */}
                    <div className={styles.cardHeader}>
                      <span className={`${styles.badge} ${styles[session.type]}`}>
                        {session.type.toUpperCase()}
                      </span>
                      
                      {isExpanded ? (
                        <button 
                          className={styles.collapseBtn}
                          onClick={(e) => {
                            e.stopPropagation(); // Stop bubble up
                            setExpandedId(null);
                          }}
                        >
                          Collapse ▲
                        </button>
                      ) : (
                        <span className={styles.date}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className={styles.title}>{session.title || "Untitled Session"}</h3>

                    {/* 2. EXPANDED CONTENT */}
                    {isExpanded ? (
                      <div 
                        className={styles.fullContent}
                        // Stop clicks here from closing the card (redundant safely)
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <div className={styles.markdown}>
                          <ReactMarkdown>{session.formatted_markdown}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      /* 3. COLLAPSED CONTENT */
                      <p className={styles.description}>
                        {session.short_description || "No description available."}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
      );
}