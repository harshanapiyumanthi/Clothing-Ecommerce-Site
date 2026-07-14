import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiCheck } from 'react-icons/fi';

const ContactUs = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    e.target.reset();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in space-y-12">
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)]">
          Contact Our Concierge
        </h1>
        <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        <p className="text-xs text-gray-500 max-w-lg mx-auto">
          Need styling advice or have questions about customized sizing measurements? Reach out to our boutique concierge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        
        {/* Contact Info Card */}
        <div className="lg:col-span-2 space-y-6 bg-gold/5 border border-gold/15 p-6 rounded-xl">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gold pb-2 border-b border-gold/10">
            Boutique Atelier
          </h2>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gold"><FiMapPin size={18} /></span>
              <p className="leading-relaxed text-gray-500">
                12 Fashion Ave, Colombo 03, Sri Lanka
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold"><FiPhone size={18} /></span>
              <p className="leading-relaxed text-gray-500">+94 (11) 789 4567</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold"><FiMail size={18} /></span>
              <p className="leading-relaxed text-gray-500">concierge@elegancefashion.com</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold mt-0.5"><FiClock size={18} /></span>
              <div className="text-gray-500 space-y-0.5">
                <p className="font-semibold">Mon - Sat: 9:00 AM - 6:00 PM</p>
                <p>Closed on Sundays and National Holidays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3 bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-wider">Send an Inquiry</h2>
          
          {formSubmitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-800 dark:text-emerald-400 p-5 rounded-lg flex items-center gap-3 text-xs">
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <p>Thank you! Your message has been received. A boutique stylist will reach out to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-gold rounded-lg" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-gold rounded-lg" 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="font-semibold text-gray-500">Subject</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-gold rounded-lg" 
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-500">Message</label>
                <textarea 
                  rows="4" 
                  required 
                  className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-gold rounded-lg resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold hover:bg-black text-white font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Submit Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
