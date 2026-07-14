import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_accepted');
    if (!consent) {
      // Show banner after 1.5 seconds delay for premium experience
      const timer = setTimeout(() => {
        setShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent_accepted', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-50 glass p-5 shadow-2xl border border-[var(--border-color)] rounded-xl flex flex-col space-y-3"
        >
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gold">Cookie Consent</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              We use cookies to curate your luxury shopping experience. By continuing to explore our collections, you agree to our{' '}
              <Link to="/privacy" className="text-gold underline hover:text-black dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex gap-2 self-end">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-gold hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Accept Cookies
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
