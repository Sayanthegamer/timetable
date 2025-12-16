import { useState } from 'react';
import { getRandomQuote } from '../../utils/bengali-quotes';
import type { BengaliQuote } from '../../utils/bengali-quotes';

export function BengaliCard() {
  const [quote, setQuote] = useState<BengaliQuote>(getRandomQuote());
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNewQuote = () => {
    setQuote(getRandomQuote());
    setIsFlipped(false);
  };

  return (
    <div className="bengali-card-container">
      <div
        className={`bengali-card ${isFlipped ? 'flipped' : ''} ${quote.type}`}
        onClick={handleFlip}
      >
        <div className="card-inner">
          <div className="card-front">
            <div className="bengali-text">{quote.bengali}</div>
          </div>
          <div className="card-back">
            <div className="translation-text">{quote.translation}</div>
          </div>
        </div>
      </div>
      <button
        onClick={handleNewQuote}
        className="new-quote-btn"
        aria-label="Get new quote"
      >
        🔄 New Quote
      </button>
    </div>
  );
}
