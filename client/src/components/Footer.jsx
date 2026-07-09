import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-primary text-secondary dark:bg-black dark:text-white border-t border-border-color mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <span className="text-3xl font-bold tracking-widest text-gold uppercase mb-4 block">
              Elegance
            </span>
            <p className="text-sm opacity-80 max-w-md leading-relaxed">
              Curating luxury fashion for the modern era. We believe in high-quality materials, sustainable practices, and timeless design.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-gold transition-colors"><FiInstagram size={20} /></a>
              <a href="#" className="hover:text-gold transition-colors"><FiTwitter size={20} /></a>
              <a href="#" className="hover:text-gold transition-colors"><FiFacebook size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 opacity-80 text-sm">
              <li><Link to="/shop?category=Women" className="hover:text-gold transition-colors">Women's Collection</Link></li>
              <li><Link to="/shop?category=Teen" className="hover:text-gold transition-colors">Teen Collection</Link></li>
              <li><Link to="/shop?category=Office" className="hover:text-gold transition-colors">Office Kit</Link></li>
              <li><Link to="/shop?category=Sarees" className="hover:text-gold transition-colors">Sarees</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2 opacity-80 text-sm">
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-xs opacity-60">
          <p>&copy; {new Date().getFullYear()} Elegance Fashion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
