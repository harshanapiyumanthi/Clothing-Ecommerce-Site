import { useState } from 'react';
import { FiSave, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CONTENT_SECTIONS = [
  { id: 'about', label: 'About Us', placeholder: 'Tell your brand story, values, and mission...' },
  { id: 'privacy', label: 'Privacy Policy', placeholder: 'Your privacy policy text...' },
  { id: 'terms', label: 'Terms & Conditions', placeholder: 'Terms and conditions text...' },
  { id: 'faq', label: 'FAQs', placeholder: 'Frequently asked questions and answers...' },
  { id: 'return', label: 'Return Policy', placeholder: 'Return and exchange policy details...' },
  { id: 'shipping', label: 'Shipping Policy', placeholder: 'Shipping methods, timelines and costs...' },
  { id: 'contact', label: 'Contact Information', placeholder: 'Business address, phone, email, hours...' },
];

const defaultContent = {
  about: 'Elegance Fashion is a Sri Lanka-based luxury fashion brand that celebrates the art of dressmaking. Founded with the belief that every woman deserves to feel extraordinary, we craft bespoke collections that blend traditional craftsmanship with contemporary design.',
  privacy: 'At Elegance Fashion, we respect your privacy and are committed to protecting your personal data. We collect information you provide when creating an account, placing orders, or contacting our support team...',
  terms: 'By using the Elegance Fashion website, you agree to our terms of service. All products are subject to availability. Prices may change without prior notice...',
  faq: 'Q: What sizes do you offer?\nA: We offer sizes XS through XXL for most styles, and custom sizing for Premium members.\n\nQ: How long does delivery take?\nA: Standard delivery is 3-5 business days. Premium members receive priority processing...',
  return: 'We accept returns within 14 days of delivery for unworn, unwashed items with original tags attached. Sale items are final sale...',
  shipping: 'We ship island-wide across Sri Lanka. Standard delivery: Rs. 350 flat rate. Orders over Rs. 8,000 qualify for free shipping. Premium members receive free shipping on all orders...',
  contact: 'Elegance Fashion\n📍 123 Atelier Lane, Colombo 03, Sri Lanka\n📞 +94 11 234 5678\n📧 support@elegancefashion.lk\n🕐 Mon-Sat: 9AM - 7PM',
};

const ContentManager = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('admin_content');
    return saved ? JSON.parse(saved) : defaultContent;
  });

  const handleSave = () => {
    localStorage.setItem('admin_content', JSON.stringify(content));
    toast.success('Content saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest">Content Management</h2>
          <p className="text-sm text-gray-500 mt-1">Edit all website text content without touching the source code.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-md shadow-gold/25 cursor-pointer">
          <FiSave /> Save All Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Selector */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            {CONTENT_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b border-[var(--border-color)] last:border-0 flex items-center gap-2 cursor-pointer ${activeSection === section.id ? 'bg-gold text-white' : 'text-gray-500 hover:text-[var(--text-color)] hover:bg-gray-50 dark:hover:bg-gray-900/40'}`}
              >
                <FiFileText size={12} /> {section.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40">
            <h3 className="font-bold uppercase tracking-wider text-sm">
              {CONTENT_SECTIONS.find(s => s.id === activeSection)?.label}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Changes are saved when you click "Save All Changes"</p>
          </div>
          <div className="p-5">
            <textarea
              value={content[activeSection] || ''}
              onChange={e => setContent(prev => ({ ...prev, [activeSection]: e.target.value }))}
              rows={18}
              placeholder={CONTENT_SECTIONS.find(s => s.id === activeSection)?.placeholder}
              className="w-full px-4 py-3 border border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/30 rounded-lg outline-none focus:border-gold text-sm font-mono leading-relaxed resize-none"
            />
          </div>
          <div className="px-5 pb-5">
            <button onClick={handleSave} className="px-6 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-gold/25">
              <FiSave /> Save This Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
