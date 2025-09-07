import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { FAQItem } from '../faqs';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQAccordionProps {
  faqs: FAQItem[];
  limit?: number;
  showSearch?: boolean;
  showViewAllLink?: boolean;
  viewAllHref?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, limit, showSearch, showViewAllLink, viewAllHref }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  const displayFaqs = limit ? filteredFaqs.slice(0, limit) : filteredFaqs;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showSearch && (
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search FAQs..."
          className="mb-6 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lvn-maroon focus:border-transparent text-base"
          aria-label="Search FAQs"
        />
      )}
      <div className="space-y-4">
        {displayFaqs.map((faq, idx) => {
          const Icon = faq.icon ? (LucideIcons as any)[faq.icon] : null;
          const isOpen = openIndex === idx;
          return (
            <div key={faq.question} className="bg-white rounded-lg shadow-sm">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-lvn-maroon rounded-lg"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
              >
                <div className="flex items-center gap-3 text-lg font-medium text-gray-900">
                  {Icon && <Icon className="w-5 h-5 text-lvn-maroon flex-shrink-0" aria-hidden="true" />}
                  <span>{faq.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${idx}`}
                  className="px-5 pb-5 pt-1 text-gray-700 text-base border-t border-gray-100"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showViewAllLink && viewAllHref && (
        <div className="text-center mt-6">
          <a
            href={viewAllHref}
            className="inline-block text-lvn-maroon hover:text-lvn-maroon-dark font-semibold text-base underline"
          >
            View Full FAQ
          </a>
        </div>
      )}
      {showSearch && filteredFaqs.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No FAQs found.</div>
      )}
    </div>
  );
};

export default FAQAccordion; 