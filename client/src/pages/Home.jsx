import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMail, FiCheck, FiHeart, FiEye, FiMessageCircle, FiClock, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });
  const [copiedCoupon, setCopiedCoupon] = useState('');

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

  // Flash Sale countdown interval ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Restart loop to simulate persistent demo countdown
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCoupon(''), 2500);
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

  // Helper format countdown double digit
  const doubleDigit = (val) => String(val).padStart(2, '0');

  return (
    <div className="animate-fade-in space-y-24 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/45 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury fashion collection showcase" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
          loading="eager"
        />
        <div className="relative z-20 text-center text-white px-4 space-y-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] font-bold text-gold text-gold"
          >
            New Collection Autumn / Winter
          </motion.p>
          <motion.h1 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-widest uppercase font-sans"
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
            <Link to="/shop" className="inline-block bg-gold text-white px-9 py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-black/15">
              Shop Collections
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Premium Flash Sales Ticking Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-black border border-[var(--border-color)] rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Accent light elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[100px] -z-10" />
          
          <div className="space-y-4 max-w-lg text-center lg:text-left">
            <span className="bg-gold/15 text-gold text-[9px] font-bold tracking-widest px-3.5 py-1 rounded-full border border-gold/25 uppercase">
              Exclusive Time-Limited Offer
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-white uppercase font-sans">
              Atelier Flash Sale
            </h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Premium tailored garments, accessories, and seasonal silk dresses marked down for a few hours. Complete your bespoke collection today.
            </p>

            {/* Countdown digits display */}
            <div className="flex justify-center lg:justify-start items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase font-bold tracking-wider">
                <FiClock className="text-gold animate-pulse" size={14} /> Ends In:
              </div>
              <div className="flex gap-2 text-white font-mono text-center">
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg min-w-12">
                  <span className="text-base font-bold block">{doubleDigit(timeLeft.hours)}</span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400">Hrs</span>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg min-w-12">
                  <span className="text-base font-bold block">{doubleDigit(timeLeft.minutes)}</span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400">Min</span>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg min-w-12">
                  <span className="text-base font-bold block-color text-gold">{doubleDigit(timeLeft.seconds)}</span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flash products preview */}
          <div className="grid grid-cols-2 gap-4 w-full lg:max-w-md shrink-0">
            {products.slice(0, 2).map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col space-y-2 relative group hover:border-gold/30 transition-all duration-300">
                <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm tracking-wider z-20">
                  -15% Off
                </div>
                <div className="h-36 overflow-hidden rounded-xl bg-gray-900 border border-white/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-200 line-clamp-1">{item.name}</h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-xs text-gold font-bold font-sans">${item.discountPrice || Math.floor(item.price * 0.85)}</span>
                    <span className="text-[10px] text-gray-500 line-through font-sans">${item.price}</span>
                  </div>
                </div>
                <Link to={`/product/${item.id}`} className="w-full bg-white/10 hover:bg-gold text-white text-[9px] uppercase tracking-widest font-bold py-1.5 rounded-lg text-center transition-colors">
                  View Detail
                </Link>
              </div>
            ))}
          </div>

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

      {/* Copyable Premium Coupons & VIP Access Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)]">
            Exclusive Coupons
          </h2>
          <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          <p className="text-[11px] text-gray-400 tracking-wider">Apply these VIP discount codes at checkout to redeem savings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Welcome coupon */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 flex items-center justify-between shadow-sm relative group overflow-hidden">
            <div className="space-y-1.5">
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-wider">Active</span>
              <h3 className="text-sm font-bold text-[var(--text-color)]">10% Welcome Discount</h3>
              <p className="text-[10px] text-gray-400">Available to all premium boutique customers</p>
              <div className="font-mono text-xs text-gold font-bold mt-2">Code: WELCOME10</div>
            </div>
            <button
              onClick={() => copyCouponCode('WELCOME10')}
              className="p-3 bg-gray-50 dark:bg-gray-900 border border-[var(--border-color)] hover:border-gold rounded-full transition-all group-hover:scale-105 flex items-center justify-center text-gray-500 hover:text-gold cursor-pointer"
              title="Copy code"
            >
              {copiedCoupon === 'WELCOME10' ? <FiCheck className="text-emerald-500 animate-scale-up" size={16} /> : <FiCopy size={16} />}
            </button>
          </div>

          {/* Gold Luxury Coupon */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 flex items-center justify-between shadow-sm relative group overflow-hidden">
            <div className="space-y-1.5">
              <span className="bg-gold/15 text-gold text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-wider">VIP Exclusive</span>
              <h3 className="text-sm font-bold text-[var(--text-color)]">20% Luxury Bundle Off</h3>
              <p className="text-[10px] text-gray-400">Save big on bespoke gown customization orders</p>
              <div className="font-mono text-xs text-gold font-bold mt-2">Code: GOLD20</div>
            </div>
            <button
              onClick={() => copyCouponCode('GOLD20')}
              className="p-3 bg-gray-50 dark:bg-gray-900 border border-[var(--border-color)] hover:border-gold rounded-full transition-all group-hover:scale-105 flex items-center justify-center text-gray-500 hover:text-gold cursor-pointer"
              title="Copy code"
            >
              {copiedCoupon === 'GOLD20' ? <FiCheck className="text-emerald-500 animate-scale-up" size={16} /> : <FiCopy size={16} />}
            </button>
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

