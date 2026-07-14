import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMail, FiCheck } from 'react-icons/fi';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Fetch products list from local database state
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    
    // Sort or filter best sellers
    const bs = products.slice(0, 3);
    setBestSellers(bs);

    // Fetch recently viewed items from local storage
    const rvIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    if (rvIds.length > 0) {
      const matched = rvIds
        .map(id => products.find(p => p.id.toString() === id.toString()))
        .filter(Boolean)
        .slice(0, 4);
      setRecentlyViewed(matched);
    }
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div className="animate-fade-in space-y-16">
      
      {/* Hero Banner Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury fashion collection showcase" 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse duration-10000"
        />
        <div className="relative z-20 text-center text-white px-4 space-y-6">
          <motion.h1 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight uppercase"
          >
            Elegance Defined
          </motion.h1>
          <motion.p 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-lg max-w-xl mx-auto font-light tracking-wide opacity-90"
          >
            Indulge in artisanal couture. Handcrafted tailoring specifications curated for your individual style profile.
          </motion.p>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/shop" className="inline-block bg-gold text-white px-8 py-3.5 uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-all duration-300">
              Shop Collections
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Curated Categories */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)]">Curated Collections</h2>
          <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/shop?category=Women" className="group relative h-96 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1515347619362-7104b2b4bc66?q=80&w=1951&auto=format&fit=crop" alt="Women Luxury collection" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-xl text-white font-bold uppercase tracking-wider mb-1">Women</h3>
              <span className="text-white text-xs uppercase tracking-widest border-b border-gold pb-1 inline-flex items-center gap-1">Shop Now <FiArrowRight /></span>
            </div>
          </Link>

          <Link to="/shop?category=Teen" className="group relative h-96 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1995&auto=format&fit=crop" alt="Teen Luxury collection" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-xl text-white font-bold uppercase tracking-wider mb-1">Teen</h3>
              <span className="text-white text-xs uppercase tracking-widest border-b border-gold pb-1 inline-flex items-center gap-1">Shop Now <FiArrowRight /></span>
            </div>
          </Link>

          <Link to="/shop?category=Accessories" className="group relative h-96 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop" alt="Bespoke Accessories" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-xl text-white font-bold uppercase tracking-wider mb-1">Accessories</h3>
              <span className="text-white text-xs uppercase tracking-widest border-b border-gold pb-1 inline-flex items-center gap-1">Shop Now <FiArrowRight /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)]">Boutique Best Sellers</h2>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestSellers.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col space-y-3">
                <div className="relative h-96 overflow-hidden bg-gray-100 border border-[var(--border-color)]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold text-gold border border-gold/25">
                    Best Seller
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--text-color)]">{product.name}</h3>
                  <p className="text-xs text-gold font-bold font-sans mt-0.5">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 border-t border-[var(--border-color)]">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)]">Recently Viewed</h2>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recentlyViewed.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col space-y-2">
                <div className="relative h-64 overflow-hidden bg-gray-100 border border-[var(--border-color)]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-[var(--text-color)] line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gold font-bold font-sans mt-0.5">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter signup banner */}
      <section className="bg-gold/5 border-y border-gold/15 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)]">
            Join The Elegance Club
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Subscribe to receive styling notes, couture previews, and exclusive offers straight to your inbox.
          </p>

          {subscribed ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-800 dark:text-emerald-400 py-3.5 px-6 max-w-sm mx-auto rounded-lg flex items-center justify-center gap-2 text-xs">
              <FiCheck />
              <span>Subscription confirmed. Thank you!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FiMail />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-[var(--border-color)] bg-transparent text-xs outline-none focus:border-gold rounded"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
