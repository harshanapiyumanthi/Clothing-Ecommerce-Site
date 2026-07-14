import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiPlus, FiMinus } from 'react-icons/fi';

const FAQ_DATA = [
  {
    question: 'How does the custom tailoring / design option work?',
    answer: 'Every eligible dress on our platform has a "Customize This Dress" option. By selecting this, you can customize the fabric choice, neck design, sleeve length, overall length, and fit. You can choose a standard size (S, M, L, XL) or input your exact body measurements (bust, waist, hips, shoulders, sleeve length, dress length). You can also upload reference sketches or inspiration photos.'
  },
  {
    question: 'How long does a customized bespoke order take to construct?',
    answer: 'Bespoke tailoring is an intricate, hand-crafted process. From the moment our master tailors review your design inputs, sketch references, and size specs, it takes approximately 5 weeks of production time to complete. Once finished, we perform a strict luxury quality inspection prior to overnight shipping.'
  },
  {
    question: 'Can I request design changes after placing a customized order?',
    answer: 'Once an order is marked as "Fabric Preparation" or "Tailoring", we are unable to implement modifications. However, if your order is still in the "Order Received" or "Design Review" stage, you can contact our luxury concierge immediately to request updates.'
  },
  {
    question: 'What premium fabrics do you offer for custom orders?',
    answer: 'We curate only high-end, luxury fabrics, including Pure Mulberry Silk, Georgette Silk, Premium French Linen, Handwoven Cotton, and Luxurious Brocade. If you have a specific, exotic fabric request, you can upload sketch notes and special instructions.'
  },
  {
    question: 'What is your shipping and return policy for custom garments?',
    answer: 'We provide complimentary shipping on all orders over $250. Because customized products are handcrafted specifically to your individual body specifications and inspired references, custom orders are final sale and non-refundable. Standard, non-customized garments can be returned within 14 days of delivery in pristine condition.'
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)]">
          Frequently Asked Questions
        </h1>
        <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        <p className="text-xs text-gray-500 max-w-lg mx-auto">
          Explore policies and guides regarding custom tailoring processes, delivery schedules, and boutique services.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div 
              key={idx} 
              className="border-b border-[var(--border-color)] pb-4 transition-colors"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full flex justify-between items-center text-left py-3 focus:outline-none group"
              >
                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--text-color)] group-hover:text-gold transition-colors">
                  {item.question}
                </span>
                <span className="text-gold shrink-0 ml-4">
                  {isOpen ? <FiMinus size={16} /> : <FiPlus size={16} />}
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 pl-1 max-w-3xl">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
