import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Shop = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortOption, setSortOption] = useState('Latest');

  // Check URL category query param
  const queryParams = new URLSearchParams(location.search);
  const urlCategory = queryParams.get('category');

  useEffect(() => {
    // Load products from local storage database
    const dbProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
    setProducts(dbProducts);

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }

    // Simulate luxury loader latency
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [urlCategory]);

  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Sorting
    if (sortOption === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Sort by Latest (or fallback order)
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, maxPrice, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4 border-b border-[var(--border-color)] pb-2 text-[var(--text-color)]">
              Filters
            </h2>
            
            <div className="space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Category</h3>
                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                  {['All', 'Women', 'Teen', 'Office', 'Casual', 'Sarees', 'Accessories'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-xs uppercase tracking-wider transition-colors cursor-pointer ${selectedCategory === cat ? 'font-bold text-gold' : 'text-gray-400 hover:text-gold'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Max Price</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="1500" 
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold bg-gray-200 dark:bg-gray-800 h-1 rounded-lg cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
                  <span>$0</span>
                  <span className="font-semibold text-gold">${maxPrice}</span>
                  <span>$1500+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow space-y-6">
          
          {/* Header toolbar */}
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4 gap-4">
            <span className="text-xs text-gray-500 font-mono">
              {filteredProducts.length} results found
            </span>
            
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent border border-[var(--border-color)] px-4 py-2 text-xs uppercase tracking-wider outline-none focus:border-gold cursor-pointer"
            >
              <option value="Latest">Sort by Latest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            // Loading Skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-3 animate-pulse">
                  <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl"
                >
                  <p className="text-xs text-gray-400">No items match your selected filters.</p>
                </motion.div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      key={product.id}
                      className="group flex flex-col space-y-3"
                    >
                      <Link to={`/product/${product.id}`} className="block relative h-80 overflow-hidden bg-gray-100 border border-[var(--border-color)]">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <span className="bg-white text-black px-6 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-all shadow-lg">
                            View Details
                          </span>
                        </div>
                      </Link>
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--text-color)]">{product.name}</h3>
                        <p className="text-xs text-gold font-bold font-sans mt-0.5">${product.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </div>
    </div>
  );
};

export default Shop;
