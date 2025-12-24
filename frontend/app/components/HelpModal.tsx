// app/components/HelpModal.tsx
import { useState } from 'react';
import styles from './HelpModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SLIDES = [
  {
    icon: "✍️",
    title: "The Scribe",
    text: "Your default mode. Don't worry about structure—just speak. Nexus captures your raw stream of consciousness and converts it into organized, clear notes."
  },
  {
    icon: "⚔️",
    title: "The Debater",
    text: "Stop the echo chamber. Say 'Switch to Debate' to summon Roger, a skeptic who challenges your assumptions and finds the flaws in your plan."
  },
  {
    icon: "🎤",
    title: "The Coach",
    text: "Prepare for high-stakes meetings.'Switch to Coach'. Sarah will listen to your pitch and interrupt with tough questions."
  },
  {
    icon: "🧠",
    title: "Memory Vault",
    text: "Nexus never forgets. Ask 'What was my idea about drones?' to search past conversations, or check your History to see all saved notes."
  }
];

export default function HelpModal({ isOpen, onClose, userId }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
      // Reset after animation completes
      setTimeout(() => setCurrentSlide(0), 300);
    }
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome to Nexus</h2>
      </div>
      
      {/* CENTERED SLIDE */}
      <div className={styles.slideContainer}>
        <div className={styles.slideIcon}>
          {SLIDES[currentSlide].icon}
        </div>
        
        <h3 className={styles.slideTitle}>
          {SLIDES[currentSlide].title}
        </h3>
        
        <p className={styles.slideText}>
          {SLIDES[currentSlide].text}
        </p>
      </div>

      {/* FOOTER CONTROLS */}
      <div className={styles.footer}>
        <div className={styles.dots}>
          {SLIDES.map((_, index) => (
            <div 
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
              onClick={(e) => {
                 e.stopPropagation();
                 setCurrentSlide(index);
              }}
            />
          ))}
        </div>

        <div className={styles.buttonGroup}>
            
            {/* 1. The Skip/Close Button */}
            <button className={styles.secondaryBtn} onClick={onClose}>
                Skip
            </button>

            {/* 2. The Main Next Button */}
            <button className={styles.actionBtn} onClick={handleNext}>
                {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
            </button>
        </div>

        <div className={styles.idLabel}>
           Session: {userId.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
}