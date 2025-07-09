export interface FAQItem {
  question: string;
  answer: string;
  icon?: string; // Lucide icon name, optional
}

export const FAQS: FAQItem[] = [
  {
    question: 'Can I cancel or change my order?',
    answer: 'If your order hasn’t shipped yet, contact us as soon as possible and we’ll do our best to help. Once shipped, changes or cancellations may not be possible.',
    icon: 'RotateCcw',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, we offer refunds for eligible returns within 30 days. See our Returns & Exchanges page for details.',
    icon: 'CreditCard',
  },
  {
    question: 'Do I need an account to place an order?',
    answer: 'No account is required. You can check out as a guest or create an account for faster future orders.',
    icon: 'User',
  },
  {
    question: 'Will I receive tracking information?',
    answer: 'Yes, you’ll get a tracking link by email as soon as your order ships.',
    icon: 'Truck',
  },
  {
    question: 'What if my item is damaged or defective?',
    answer: 'Contact us right away with a photo and we’ll arrange a replacement or refund.',
    icon: 'AlertTriangle',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'Email us at support@backreform.co.uk or use the WhatsApp link on our site. We aim to reply within 1 business day.',
    icon: 'Mail',
  },
  {
    question: 'Can I order in bulk for my local Reform group?',
    answer: 'Yes! Contact us for bulk pricing and custom options for local groups.',
    icon: 'Users',
  },
  {
    question: 'Do you offer gift packaging or notes?',
    answer: 'We don’t offer gift packaging yet, but you can add a note at checkout and we’ll include it in your order.',
    icon: 'Gift',
  },
  // Example of a general shipping FAQ
  {
    question: 'How long does shipping take?',
    answer: 'Standard UK shipping is 3–5 business days. Express options are available at checkout.',
    icon: 'Clock',
  },
  // Example of a payment FAQ
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, Apple Pay, Google Pay, and PayPal.',
    icon: 'CreditCard',
  },
]; 