import React from 'react';
import { FAQS } from './faqs';
import FAQAccordion from './FAQAccordion';

const FAQPage = () => {
  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to our most common questions. If you can’t find what you’re looking for, contact our support team.
          </p>
        </div>
        <FAQAccordion faqs={FAQS} showSearch={true} />
      </div>
    </section>
  );
};

export default FAQPage;