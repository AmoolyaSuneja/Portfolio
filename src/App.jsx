import { useState } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import Intro from './Intro';
import Portfolio from './Portfolio';

function App() {
  const [showPortfolio, setShowPortfolio] = useState(false);

  return (
    <ReactLenis root>
      {!showPortfolio && <Intro onComplete={() => setShowPortfolio(true)} />}
      {showPortfolio && <Portfolio />}
    </ReactLenis>
  );
}

export default App;
