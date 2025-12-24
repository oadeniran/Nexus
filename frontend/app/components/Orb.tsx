// app/components/Orb.tsx
import styles from './Orb.module.css';

interface Props {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  isSpeaking: boolean; // Agent is speaking
  onClick: () => void;
}

export default function Orb({ status, isSpeaking, onClick }: Props) {
  
  // Logic to determine visual state
  const isListening = status === 'connected' && !isSpeaking;
  const isAgentTalking = status === 'connected' && isSpeaking;
  
  // Base class
  let stateClass = '';
  
  if (isAgentTalking) {
    stateClass = styles.speaking;
  } else if (isListening) {
    stateClass = styles.listening;
  }

  return (
    // 2. Attach onClick here
    <div className={`${styles.container} ${stateClass}`} onClick={onClick}>
      <div className={styles.liquidCore} />
      <div className={styles.innerCore} />
      
      {/* Ripples */}
      <div className={styles.ripple} />
      <div className={styles.ripple} />
      <div className={styles.ripple} />
    </div>
  );
}