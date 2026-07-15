import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, title, children, position = 'left' }) => {
  // Prevent body scrolling when active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const slideVariants = {
    hidden: { x: position === 'left' ? '-100%' : '105%' },
    visible: { x: 0 },
    exit: { x: position === 'left' ? '-100%' : '105%' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
            className={`relative flex flex-col w-full max-w-sm h-full bg-[var(--card-bg)] text-[var(--text-color)] shadow-2xl ${
              position === 'left' ? 'mr-auto border-r border-[var(--border-color)]' : 'ml-auto border-l border-[var(--border-color)]'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
              {title && (
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-color)]">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gold transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
