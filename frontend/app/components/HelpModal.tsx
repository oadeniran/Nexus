import ReactMarkdown from 'react-markdown';
import styles from './HistoryHelpOverlay.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const helpContent = `
# Nexus: The Founder's Second Brain

**Nexus is a voice-first cognitive architecture designed to accelerate the journey from "fleeting thought" to "executed strategy."**

Founders and builders often lose their best ideas to friction or refine them in an echo chamber. Nexus solves this by providing specialized AI agents that act as your Scribe, your Skeptic, and your Coach—all through natural conversation.

## Operational Modes

### 1. The Scribe (Capture & Structure)
* **The Problem:** You have a brilliant idea while walking or driving, but typing it out breaks your flow.
* **The Solution:** Speak freely. Nexus acts as a strategic partner, filtering the noise from your stream of consciousness and converting it into structured, high-fidelity Markdown notes.
* **The Output:** Raw thoughts become organized assets instantly saved to your Memory Vault.

### 2. The Debater (Validation Stress-Test)
* **The Problem:** The "Echo Chamber." It feels good when everyone agrees with you, but it's dangerous for business.
* **The Persona:** "Roger" – A skeptical Venture Capitalist / Senior Engineer.
* **The Workflow:** Nexus recalls your specific idea and simulates an adversarial feedback loop. It challenges your assumptions, exposes logic gaps, and forces you to defend your feasibility.
* **Command:** *"Switch to Debate."*

### 3. The Coach (Pitch & Execution)
* **The Problem:** Rehearsing in your head is easy; rehearsing for a hostile audience is hard.
* **The Persona:** "Sarah" – A fast-paced Pitch Coach.
* **The Workflow:** There are no slides to hide behind. You simply present your pitch to Nexus. The agent analyzes your narrative flow, clarity, and pacing in real-time, interrupting you with the difficult questions a real stakeholder would ask.
* **Command:** *"Switch to Coach."*

---

## Intelligence Engine

Nexus utilizes a persistent **Vector Memory System** to maintain continuity. It doesn't just "hear" you; it "remembers" you.

* **Zero-Loss Handoff:** When you switch from *Ideating* to *Debating*, the full context of your idea is whispered to the new agent instantly. No need to repeat yourself.
* **Semantic Recall:** Ask Nexus to retrieve details from months ago. *Example: "What was the revenue model I proposed for the drone project?"*

## Controls
* **Memory Vault (History):** A transparent archive of your intellectual property—transcripts, summaries, and debate reports.
`;

export default function HelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      style={{ zIndex: 3000 }} // This one-off inline style is fine
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.overlayHeader}>
        <h2 className={styles.overlayTitle}>User Manual</h2>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      
      <div className={styles.scrollContainer}>
        <div className={styles.helpContainer}>
           <div className={`${styles.card} ${styles.helpCard}`}>
              <div className={styles.markdown}>
                <ReactMarkdown>{helpContent}</ReactMarkdown>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}