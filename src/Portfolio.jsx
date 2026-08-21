import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const cardsData = [
  { id: 'hero', rank: 'A', suit: '♠', suitColor: '#1a1a1a', component: <HeroSection /> },
  { id: 'about', rank: 'K', suit: '♥', suitColor: '#b91c1c', component: <AboutSection /> },
  { id: 'skills', rank: 'Q', suit: '♦', suitColor: '#b91c1c', component: <SkillsSection /> },
  { id: 'projects', rank: 'J', suit: '♣', suitColor: '#1a1a1a', component: <ProjectsSection /> },
  { id: 'experience', rank: '10', suit: '♠', suitColor: '#1a1a1a', component: <ExperienceSection /> },
  { id: 'contact', rank: '9', suit: '♥', suitColor: '#b91c1c', component: <ContactSection /> },
];

export default function Portfolio() {
  const order = useRef([0, 1, 2, 3, 4, 5]);
  const isAnimating = useRef(false);

  const getSpringProps = (positionIndex) => ({
    x: 0,
    y: positionIndex * 15, // Staggered downwards by 15px
    rot: 0,
    zIndex: cardsData.length - positionIndex,
    config: { mass: 1, tension: 400, friction: 30 }
  });

  const [springs, api] = useSprings(cardsData.length, i => getSpringProps(order.current.indexOf(i)));

  const cycleDeck = (dir = 1) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const currentTopIndex = order.current[0];
    order.current.push(order.current.shift());

    // Shorter, cleaner distance for desktop. Mobile goes completely off screen.
    const isMobile = window.innerWidth < 600;
    const exitX = isMobile ? window.innerWidth + 100 : 600;

    api.start(i => {
      const newPos = order.current.indexOf(i);
      if (i === currentTopIndex) {
        return {
          x: exitX * dir, 
          rot: dir * 15,
          config: { mass: 1, tension: 400, friction: 35 } 
        };
      } else {
        return {
          x: 0,
          rot: 0,
          y: newPos * 15,
          zIndex: cardsData.length - newPos,
          config: { mass: 1, tension: 300, friction: 30 },
          immediate: (key) => key === 'zIndex'
        };
      }
    });

    // Yank it back while it's completely off-screen
    setTimeout(() => {
      // 1. Instantly drop ONLY the zIndex! Do not snap Y or Rot!
      api.start(i => {
        if (i === currentTopIndex) {
          const newPos = order.current.indexOf(i);
          return {
            zIndex: cardsData.length - newPos,
            immediate: key => key === 'zIndex' // ONLY SNAP Z-INDEX!
          };
        }
      });

      // 2. Next frame, smoothly slide it naturally back into its position!
      requestAnimationFrame(() => {
        api.start(i => {
          if (i === currentTopIndex) {
            const newPos = order.current.indexOf(i);
            return {
              x: 0, 
              y: newPos * 15,
              rot: 0,
              config: { mass: 1, tension: 250, friction: 30 }, 
              immediate: false
            };
          }
        });
      });

      setTimeout(() => {
        isAnimating.current = false;
      }, 350);
    }, 200); 
  };

  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity: [vx], event }) => {
    const isTop = order.current[0] === index;
    if (!isTop || isAnimating.current) return; 

    // Prevent dragging if they clicked a button/link inside the card
    if (event.target.tagName === 'A' || event.target.tagName === 'SPAN') return;

    if (!down && (vx > 0.3 || Math.abs(mx) > 100)) {
      // Swiped!
      cycleDeck(mx > 0 ? 1 : -1); 
    } else if (!down && Math.abs(mx) < 5) {
      // Clicked!
      cycleDeck(1);
    } else {
      // Dragging
      api.start(i => {
        if (i !== index) return;
        return {
          x: down ? mx : 0,
          rot: down ? mx / 30 : 0,
          config: { friction: 50, tension: down ? 800 : 500 },
          immediate: down // CRITICAL: Stop physics engine from fighting the mouse while dragging
        };
      });
    }
  });

  return (
    <motion.div 
      className="portfolio-deck-container"
      initial={{ y: '80vh', filter: 'blur(20px)', opacity: 0.2 }}
      animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="deck">
        {springs.map(({ x, y, rot, zIndex }, i) => {
          const isTop = order.current[0] === i;
          const { id, rank, suit, suitColor, component } = cardsData[i];
          return (
            <animated.div
              {...bind(i)}
              key={id}
              className={`deck-card card-${id}`}
              style={{
                x,
                y,
                rotateZ: rot,
                zIndex,
                cursor: isTop ? 'grab' : 'default',
                touchAction: 'none'
              }}
            >
              <div className="card-design-inner">
                {/* Playing Card Corner Indices */}
                <div className="card-corner top-left" style={{ color: suitColor }}>
                  <div className="rank">{rank}</div>
                  <div className="suit">{suit}</div>
                </div>
                <div className="card-corner bottom-right" style={{ color: suitColor }}>
                  <div className="rank">{rank}</div>
                  <div className="suit">{suit}</div>
                </div>

                <div className="card-content">
                  {component}
                </div>
              </div>
            </animated.div>
          );
        })}
      </div>
      <div className="instruction-text">
        <p>Swipe or click to deal</p>
      </div>
    </motion.div>
  );
}

// ----------------- SUBCOMPONENTS -----------------

function HeroSection() {
  return (
    <section className="card-section hero-card">
      <h1>Full-Stack Developer</h1>
      <p className="tagline">Building robust and scalable web applications.</p>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="card-section">
      <h3>About</h3>
      <p>
        I am a B.Tech CSE Graduate from Jaypee University of Engineering and Technology. 
        My journey has taken me from academic foundations to building production-ready features.
        I specialize in the modern web stack, focusing on performance, scalability, and clean architecture.
      </p>
    </section>
  );
}

function SkillsSection() {
  return (
    <section className="card-section">
      <h3>Tech Stack</h3>
      <div className="skills-grid">
        <div className="skill-category">
          <h4>Languages</h4>
          <p>JavaScript, TypeScript, C++, HTML, CSS, SQL</p>
        </div>
        <div className="skill-category">
          <h4>Frontend</h4>
          <p>React.js, Tailwind CSS, Vite, TanStack Query, Zustand, Zod</p>
        </div>
        <div className="skill-category">
          <h4>Backend</h4>
          <p>Node.js, Express, REST APIs, WebSockets, JWT, bcrypt, Prisma, Mongoose</p>
        </div>
        <div className="skill-category">
          <h4>Databases & Tools</h4>
          <p>MongoDB, MySQL, Git, GitHub, Vercel, Cloudinary, Postman, Turborepo</p>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className="card-section projects-card">
      <h3>Projects</h3>
      <div className="project-item">
        <div className="project-header">
          <h4>VaultX</h4>
          <div className="project-links">
            <a href="https://vault-x-red.vercel.app/" target="_blank" rel="noreferrer" className="btn-small" onClick={(e) => e.stopPropagation()}>Live Demo</a>
            <span className="btn-small outline" onClick={(e) => e.stopPropagation()}>GitHub</span>
          </div>
        </div>
        <p className="tech-stack">React 18, TypeScript, Vite, Node.js, MongoDB</p>
        <p className="project-desc">Secure Personal Vault with Multi-Party Authorization. Features AES-256-GCM encryption.</p>
      </div>
      <div className="project-item">
        <div className="project-header">
          <h4>PixelVerse</h4>
          <div className="project-links">
            <a href="https://pixelversepv.vercel.app/" target="_blank" rel="noreferrer" className="btn-small" onClick={(e) => e.stopPropagation()}>Live Demo</a>
            <span className="btn-small outline" onClick={(e) => e.stopPropagation()}>GitHub</span>
          </div>
        </div>
        <p className="tech-stack">React 19, Tailwind CSS, Prisma, Node.js</p>
        <p className="project-desc">Full-Stack Real-Time 2D Web Metaverse featuring real-time arenas.</p>
      </div>
      <div className="project-item">
        <div className="project-header">
          <h4>SketchSphere</h4>
          <div className="project-links">
            <a href="https://sketch-sphere-opal.vercel.app/" target="_blank" rel="noreferrer" className="btn-small" onClick={(e) => e.stopPropagation()}>Live Demo</a>
            <span className="btn-small outline" onClick={(e) => e.stopPropagation()}>GitHub</span>
          </div>
        </div>
        <p className="tech-stack">React, WebSockets, HTML5 Canvas, AI</p>
        <p className="project-desc">Real-Time Collaborative Whiteboard with event-driven communication.</p>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="card-section">
      <h3>Experience</h3>
      
      <div className="experience-item">
        <div className="exp-header">
          <h4>Junior Developer</h4>
          <span>BIT TO BYTE ROBOTICS | Jul 2026 – Present</span>
        </div>
        <ul>
          <li>Contributing to software development projects by building and improving applications.</li>
          <li>Collaborating with the team to deliver reliable solutions and solve technical challenges.</li>
        </ul>
        <p className="tech-stack" style={{marginTop: '0.5em'}}>JS, React.js, Node.js, Express.js, MongoDB, PostgreSQL, Tailwind CSS</p>
      </div>

      <div className="experience-item">
        <div className="exp-header">
          <h4>Web Developer Intern</h4>
          <span>EliteTech | May 2025 – Jul 2025</span>
        </div>
        <ul>
          <li>Shipped user-facing features in a React-based production web application.</li>
          <li>Integrated REST APIs into frontend workflows and refactored components.</li>
        </ul>
        <p className="tech-stack" style={{marginTop: '0.5em'}}>JS, React.js, Node.js, Express.js, MongoDB, PostgreSQL, Tailwind CSS</p>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="card-section contact-card">
      <h3>Contact</h3>
      <div className="contact-links" style={{ flexDirection: 'column' }}>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=asuneja007@gmail.com" target="_blank" rel="noreferrer" className="btn" onClick={(e) => e.stopPropagation()}>Email Me</a>
        <a href="https://github.com/AmoolyaSuneja" target="_blank" rel="noreferrer" className="btn outline" onClick={(e) => e.stopPropagation()}>GitHub</a>
        <a href="https://linkedin.com/in/amoolya-suneja" target="_blank" rel="noreferrer" className="btn outline" onClick={(e) => e.stopPropagation()}>LinkedIn</a>
      </div>
    </section>
  );
}
