import { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Intro({ onComplete }) {
  const [phase, setPhase] = useState(2);
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleGlobalInteraction = (e) => {
      // If it's a keydown event, only proceed if it's the Space key
      if (e && e.type === 'keydown') {
        if (e.code !== 'Space') return;
        e.preventDefault();
      }

      if (phase === 2) {
        setPhase(3); // Trigger shatter
        setTimeout(() => onComplete(), 400); // Fast completion
      }
    };

    window.addEventListener('pointerdown', handleGlobalInteraction);
    window.addEventListener('keydown', handleGlobalInteraction);

    // Fallback for laptops with trackpads/scroll wheels
    const handleScroll = () => {
      if (phase === 2) handleGlobalInteraction();
    };
    window.addEventListener('wheel', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
      window.removeEventListener('wheel', handleScroll);
    };
  }, [phase, onComplete]);

  // Generate random scatter values for each letter
  const getScatterVariants = (index) => {
    const randomX = (Math.random() - 0.5) * 1000;
    const randomY = (Math.random() - 0.5) * 1000;
    const randomRotate = (Math.random() - 0.5) * 720;

    return {
      initial: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4 + index * 0.04 } },
      scatter: {
        x: randomX,
        y: randomY,
        rotate: randomRotate,
        opacity: 0,
        scale: 0,
        filter: "blur(10px)",
        transition: { duration: 1, ease: "easeInOut" }
      }
    };
  };

  const line1 = "Hey this is Amoolya!".split("");
  const line2 = "Welcome to my portfolio".split("");

  return (
    <div
      className="intro-container"
      style={{ cursor: phase === 2 ? 'pointer' : 'default' }}
    >
      {phase >= 2 && (
        <div className="welcome-screen">
          <div className="shatter-text-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-4vh)' }}>
            <h2 style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '100%', marginBottom: '1rem' }}>
              {line1.map((char, i) => (
                <motion.span
                  key={`l1-${i}`}
                  variants={getScatterVariants(i)}
                  initial="initial"
                  animate={phase === 3 ? "scatter" : "visible"}
                  style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                  {char}
                </motion.span>
              ))}
            </h2>
            <h1 style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
              {line2.map((char, i) => (
                <motion.span
                  key={`l2-${i}`}
                  variants={getScatterVariants(i + line1.length)}
                  initial="initial"
                  animate={phase === 3 ? "scatter" : "visible"}
                  style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 3 ? 0 : 1 }}
            transition={{ delay: 1 }}
          >
            <span className="desktop-text">Scroll</span>
            <span className="mobile-text">Swipe / Tap</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
