import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-primary text-secondary dark:bg-black dark:text-white border-t border-[var(--border-color)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-2xl font-bold tracking-[0.25em] text-gold uppercase block">
              ELEGANCE
            </span>
            <p className="text-xs opacity-75 max-w-sm leading-relaxed font-light">
              Crafting premium luxury garments with sustainable materials, bespoke tailoring accuracy, and timeless high-fashion aesthetics for the discerning modern clientele.
            </p>
            <div className="flex space-x-6 pt-2">
              <a href="#" aria-label="Instagram link" className="hover:text-gold transition-colors duration-300"><FiInstagram size={18} /></a>
              <a href="#" aria-label="Twitter link" className="hover:text-gold transition-colors duration-300"><FiTwitter size={18} /></a>
              <a href="#" aria-label="Facebook link" className="hover:text-gold transition-colors duration-300"><FiFacebook size={18} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-gold">Shop Pages</h3>
            <ul className="space-y-3 opacity-80 text-xs font-semibold tracking-wider uppercase">
              <li><Link to="/shop?category=Women" className="hover:text-gold transition-colors">Women's Collection</Link></li>
              <li><Link to="/shop?category=Teen" className="hover:text-gold transition-colors">Teen Collection</Link></li>
              <li><Link to="/shop?category=Office" className="hover:text-gold transition-colors">Office Wear</Link></li>
              <li><Link to="/shop?category=Sarees" className="hover:text-gold transition-colors">Sarees</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-gold">Customer Care</h3>
            <ul className="space-y-3 opacity-80 text-xs font-semibold tracking-wider uppercase">
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition-colors">FAQs</Link></li>
              <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-[var(--border-color)] mt-16 pt-8 text-center text-[10px] uppercase tracking-widest opacity-60">
          <p>&copy; {new Date().getFullYear()} Elegance Fashion Couture. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

