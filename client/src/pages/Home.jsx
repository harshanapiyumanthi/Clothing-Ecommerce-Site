import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMail, FiCheck, FiHeart, FiEye, FiMessageCircle } from 'react-icons/fi';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const dbProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
    setProducts(dbProducts);

    const rvIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    if (rvIds.length > 0) {
      const matched = rvIds
        .map(id => dbProducts.find(p => p.id.toString() === id.toString()))
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

  // Get active tab products
  const getTabProducts = () => {
    if (activeTab === 'new') {
      return [...products].reverse().slice(0, 4);
    } else if (activeTab === 'best') {
      return products.slice(0, 4);
    } else {
      // trending
      return products.slice(1, 5).length > 0 ? products.slice(1, 5) : products.slice(0, 4);
    }
  };

  const categories = [
    { name: 'Women', image: 'https://images.unsplash.com/photo-1515347619362-7104b2b4bc66?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Women' },
    { name: 'Teen', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Teen' },
    { name: 'Office Wear', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Office' },
    { name: 'Casual Wear', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Casual' },
    { name: 'Party Wear', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Party' },
    { name: 'Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Sarees' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop', link: '/shop?category=Accessories' },
  ];

  const instagramPosts = [
    { id: 1, likes: '1.8k', comments: 45, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop' },
    { id: 2, likes: '2.4k', comments: 88, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop' },
    { id: 3, likes: '3.1k', comments: 120, image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=400&auto=format&fit=crop' },
    { id: 4, likes: '1.2k', comments: 32, image: 'https://images.unsplash.com/photo-1515347619362-7104b2b4bc66?q=80&w=400&auto=format&fit=crop' },
    { id: 5, likes: '4.0k', comments: 154, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop' },
    { id: 6, likes: '2.9k', comments: 92, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  ];

  return (
    <div className="animate-fade-in space-y-20 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury fashion collection showcase" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 text-center text-white px-4 space-y-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] font-semibold text-gold"
          >
            New Collection Autumn / Winter
          </motion.p>
          <motion.h1 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight uppercase font-sans"
          >
            Elegance Defined
          </motion.h1>
          <motion.p 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs sm:text-sm max-w-lg mx-auto font-light tracking-widest leading-relaxed opacity-95"
          >
            Indulge in artisanal couture. Handcrafted tailoring specifications curated for your individual style profile.
          </motion.p>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="pt-4"
          >
            <Link to="/shop" className="inline-block bg-gold text-white px-9 py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-black/10">
              Shop Collections
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Collection Tabs (Trending / New / Best Sellers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex border-b border-[var(--border-color)]">
            {['trending', 'new', 'best'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'border-gold text-gold font-extrabold' 
                    : 'border-transparent text-gray-400 hover:text-[var(--text-color)]'
                }`}
              >
                {tab === 'trending' ? 'Trending' : tab === 'new' ? 'New Arrivals' : 'Best Sellers'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {getTabProducts().map((product) => (
              <div key={product.id} className="group flex flex-col space-y-3">
                <Link to={`/product/${product.id}`} className="block relative h-96 overflow-hidden bg-gray-100 border border-[var(--border-color)]">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="bg-white text-black px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-all shadow-md">
                      View Details
                    </span>
                  </div>
                </Link>
                <div>
                  <h3 className="font-semibold text-xs text-[var(--text-color)] line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gold font-bold font-sans mt-0.5">${product.price}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Curated Categories Extended Grid */}
      <section className="py-12 bg-gray-50/50 dark:bg-gray-950/20 border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)]">Curated Collections</h2>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((cat, idx) => (
              <Link to={cat.link} key={idx} className="group relative h-96 overflow-hidden bg-gray-250">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-lg text-white font-bold uppercase tracking-wider mb-1">{cat.name}</h3>
                  <span className="text-white text-[9px] font-bold uppercase tracking-widest border-b border-gold pb-0.5 inline-flex items-center gap-1.5 transition-colors group-hover:text-gold">
                    Shop Now <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(4).map((cat, idx) => (
              <Link to={cat.link} key={idx} className="group relative h-[320px] overflow-hidden bg-gray-250">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-lg text-white font-bold uppercase tracking-wider mb-1">{cat.name}</h3>
                  <span className="text-white text-[9px] font-bold uppercase tracking-widest border-b border-gold pb-0.5 inline-flex items-center gap-1.5 transition-colors group-hover:text-gold">
                    Shop Now <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
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

      {/* Instagram Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)]">
            Shop Our Instagram
          </h2>
          <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          <p className="text-[11px] text-gray-400 tracking-wider">Tag @EleganceFashion to be featured in our couture gallery</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square overflow-hidden bg-gray-150 group border border-[var(--border-color)]">
              <img 
                src={post.image} 
                alt="Instagram social look" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide font-sans">
                  <FiHeart className="fill-white" /> {post.likes}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] opacity-80 tracking-wide font-sans">
                  <FiMessageCircle /> {post.comments} Comments
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter signup banner */}
      <section className="bg-gold/5 border-y border-gold/15 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)] font-sans">
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
