import { useState } from 'react';

function FAQSection({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!items.length) return null;

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
            <button
              type="button"
              className="faq-item__button"
              aria-expanded={isOpen}
              aria-controls={`faq-content-${index}`}
              id={`faq-btn-${index}`}
              onClick={() => toggle(index)}
            >
              <span className="faq-item__q">{item.question}</span>
              <span className="faq-item__icon" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-content-${index}`}
              role="region"
              aria-labelledby={`faq-btn-${index}`}
              className={`faq-item__content${isOpen ? ' faq-item__content--open' : ''}`}
            >
              <p className="faq-item__answer">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FAQSection;
