import { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Intro({ onComplete }) {
  const [phase, setPhase] = useState(0); 
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && phase === 0) {
        e.preventDefault();
        setPhase(1);
        setTimeout(() => setPhase(2), 2500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  useEffect(() => {
    if (phase >= 2) {
      const handleScroll = (e) => {
        if (phase === 2) {
          setPhase(3); // Trigger shatter
          setTimeout(() => onComplete(), 400); // Fast completion
        }
      };
      window.addEventListener('wheel', handleScroll, { passive: true });
      window.addEventListener('touchmove', handleScroll, { passive: true });
      window.addEventListener('click', handleScroll);
      return () => {
        window.removeEventListener('wheel', handleScroll);
        window.removeEventListener('touchmove', handleScroll);
        window.removeEventListener('click', handleScroll);
      };
    }
  }, [phase, onComplete]);

  // Generate random scatter values for each letter
  const getScatterVariants = (index) => {
    const randomX = (Math.random() - 0.5) * 1000;
    const randomY = (Math.random() - 0.5) * 1000;
    const randomRotate = (Math.random() - 0.5) * 720;
    
    return {
      initial: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: index * 0.02 } },
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

  const line1 = "Hey this is amoolya!".split("");
  const line2 = "Welcome to my portfolio".split("");

  return (
    <div 
      className="intro-container"
      onClick={() => {
        if (phase === 0) {
          setPhase(1);
          setTimeout(() => setPhase(2), 2500);
        }
      }}
      style={{ cursor: phase === 0 ? 'pointer' : 'default' }}
    >
      {phase === 0 && (
        <div className="spacebar-prompt">
          <div className="geometric-shape"></div>
          <h1 className="desktop-text">Hit space bar</h1>
          <h1 className="mobile-text">Click to proceed</h1>
        </div>
      )}

      {phase === 1 && (
        <div className="expanding-shape"></div>
      )}

      {phase >= 2 && (
        <div className="welcome-screen">
          <div className="shatter-text-container">
            <h2 style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
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
            <h1 style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            <div className="scroll-line"></div>
            <span className="desktop-text">Scroll</span>
            <span className="mobile-text">Swipe / Tap</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
