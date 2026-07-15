import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiEye, FiX, FiMinus, FiPlus, FiShoppingBag, FiSearch } from 'react-icons/fi';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/Breadcrumb';

const Shop = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [sortOption, setSortOption] = useState('Latest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [qvQty, setQvQty] = useState(1);
  const [qvSize, setQvSize] = useState('M');
  const [qvColor, setQvColor] = useState('');

  // Check URL category query param
  const queryParams = new URLSearchParams(location.search);
  const urlCategory = queryParams.get('category');

  useEffect(() => {
    const dbProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
    setProducts(dbProducts);

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [urlCategory]);

  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Color Filter
    if (selectedColor !== 'All') {
      result = result.filter(p => p.colors?.includes(selectedColor));
    }

    // Fabric Filter (match fabric in description or defaults)
    if (selectedFabric !== 'All') {
      result = result.filter(p => p.description?.toLowerCase().includes(selectedFabric.toLowerCase()) || p.name?.toLowerCase().includes(selectedFabric.toLowerCase()));
    }

    if (selectedOccasion !== 'All') {
      result = result.filter(p => p.description?.toLowerCase().includes(selectedOccasion.toLowerCase()) || p.name?.toLowerCase().includes(selectedOccasion.toLowerCase()));
    }

    if (selectedStyle !== 'All') {
      result = result.filter(p => p.description?.toLowerCase().includes(selectedStyle.toLowerCase()) || p.name?.toLowerCase().includes(selectedStyle.toLowerCase()));
    }

    if (selectedBrand !== 'All') {
      result = result.filter(p => p.description?.toLowerCase().includes(selectedBrand.toLowerCase()) || p.name?.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    // Size Filter
    if (selectedSize !== 'All') {
      result = result.filter(p => p.sizes?.includes(selectedSize));
    }

    // Sorting
    if (sortOption === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset page on filter change
  }, [products, searchQuery, selectedCategory, maxPrice, selectedColor, selectedFabric, selectedOccasion, selectedStyle, selectedBrand, selectedSize, sortOption]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const colorsList = [
    { name: 'All', value: 'All' },
    { name: 'Navy', value: '#0f172a' },
    { name: 'Gold', value: '#b45309' },
    { name: 'Burgundy', value: '#be123c' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
  ];

  const fabricsList = ['All', 'Silk', 'Linen', 'Cotton', 'Velvet', 'Wool'];
  const occasionsList = ['All', 'Wedding', 'Party', 'Casual', 'Office'];
  const stylesList = ['All', 'Modern', 'Classic', 'Vintage', 'Bohemian'];
  const brandsList = ['All', 'Elegance', 'Boutique', 'Couture'];
  const sizesList = ['All', 'S', 'M', 'L', 'XL'];

  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    const isWishlisted = wishlistItems.some(item => item.id === product.id);
    if (isWishlisted) {
      toast.info(`Removed ${product.name} from Wishlist`);
    } else {
      toast.success(`Saved ${product.name} to Wishlist!`);
    }
  };

  const handleOpenQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
    setQvQty(1);
    setQvSize(product.sizes?.[0] || 'M');
    setQvColor(product.colors?.[0] || '');
  };

  const handleQvAddToCart = () => {
    if (!userInfo) {
      toast.warning('Please log in or register to add items to your cart.');
      navigate('/login');
      return;
    }
    dispatch(addToCart({
      id: quickViewProduct.id,
      productId: quickViewProduct.id,
      name: quickViewProduct.name,
      price: quickViewProduct.price,
      image: quickViewProduct.image || quickViewProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80',
      qty: qvQty,
      size: qvSize,
      color: qvColor,
      isCustom: false
    }));
    toast.success(`${quickViewProduct.name} added to cart!`);
    setQuickViewProduct(null);
  };

  const breadcrumbItems = [{ label: 'Shop', link: '/shop' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl h-fit">
          <div className="space-y-6">
            
            {/* Search Input */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-xs bg-transparent border border-[var(--border-color)] rounded outline-none focus:border-gold"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                  <FiSearch size={14} />
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3">Category</h3>
              <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                {['All', 'Women', 'Teen', 'Office', 'Casual', 'Accessories'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-xs uppercase tracking-wider transition-colors cursor-pointer ${selectedCategory === cat ? 'font-bold text-gold' : 'text-gray-405 hover:text-gold'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3">Max Price</h3>
              <input 
                type="range" 
                min="0" 
                max="1500" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-gold bg-gray-200 dark:bg-gray-805 h-1 rounded-lg cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
                <span>$0</span>
                <span className="font-semibold text-gold">${maxPrice}</span>
                <span>$1500+</span>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3">Color swatch</h3>
              <div className="flex flex-wrap gap-2">
                {colorsList.map((col, idx) => (
                  col.value === 'All' ? (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor('All')}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border cursor-pointer ${selectedColor === 'All' ? 'border-gold text-gold bg-gold/10' : 'border-[var(--border-color)] text-gray-400 hover:text-gold'}`}
                    >
                      All
                    </button>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(col.value)}
                      style={{ backgroundColor: col.value }}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${selectedColor === col.value ? 'border-gold scale-105' : 'border-transparent'}`}
                      title={col.name}
                    />
                  )
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-2.5">Fabric</h3>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full p-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
              >
                {fabricsList.map((fab, idx) => (
                  <option key={idx} value={fab}>{fab}</option>
                ))}
              </select>
            </div>

            {/* Occasion */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-2.5">Occasion</h3>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full p-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
              >
                {occasionsList.map((occ, idx) => (
                  <option key={idx} value={occ}>{occ}</option>
                ))}
              </select>
            </div>
            
            {/* Style */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-2.5">Style</h3>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
              >
                {stylesList.map((stl, idx) => (
                  <option key={idx} value={stl}>{stl}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-2.5">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
              >
                {brandsList.map((brnd, idx) => (
                  <option key={idx} value={brnd}>{brnd}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizesList.map((sz, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-9 h-9 border text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${selectedSize === sz ? 'border-gold bg-gold/10 text-gold font-bold' : 'border-[var(--border-color)] text-gray-500 hover:border-gray-400'}`}
                  >
                    {sz}
                  </button>
                ))}
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
                <div className="space-y-8">
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => {
                      const isWishlisted = wishlistItems.some(x => x.id === product.id);
                      const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          key={product.id}
                          className="group flex flex-col space-y-3 relative bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-2xl hover:shadow-lg transition-all duration-300"
                        >
                          <Link to={`/product/${product.id}`} className="block relative h-80 overflow-hidden rounded-xl bg-gray-100 border border-[var(--border-color)]">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                            
                            {/* Discount badge */}
                            {hasDiscount && (
                              <div className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm tracking-wider z-20">
                                Save ${(product.price - product.discountPrice)}
                              </div>
                            )}

                            {/* Wishlist toggle button */}
                            <button
                              onClick={(e) => handleWishlistToggle(e, product)}
                              className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full shadow hover:text-gold transition-colors z-20 cursor-pointer"
                              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                              <FiHeart size={14} className={isWishlisted ? 'fill-gold text-gold animate-scale-up' : 'text-gray-650'} />
                            </button>
 
                            {/* View details & Quick View hover overlay */}
                            <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4 space-y-2">
                              <span className="bg-white text-black px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-all shadow-md">
                                View Details
                              </span>
                              <button
                                onClick={(e) => handleOpenQuickView(e, product)}
                                className="bg-black/90 text-white px-5 py-2 text-[9px] uppercase tracking-widest font-bold hover:bg-gold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <FiEye size={12} /> Quick View
                              </button>
                            </div>
                          </Link>
                          <div className="px-1">
                            <h3 className="font-semibold text-xs text-[var(--text-color)] line-clamp-1">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gold font-bold font-sans">
                                ${hasDiscount ? product.discountPrice : product.price}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] text-gray-500 line-through font-sans">
                                  ${product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Pagination component */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-6 border-t border-[var(--border-color)]">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-[var(--border-color)] rounded text-xs hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Prev
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer border ${
                            currentPage === i + 1 
                              ? 'bg-gold border-gold text-white font-bold' 
                              : 'border-[var(--border-color)] text-gray-500 hover:border-gold hover:text-gold'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-[var(--border-color)] rounded text-xs hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}

                </div>
              )}
            </AnimatePresence>
          )}

        </div>
      </div>

      {/* Quick View Details Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gold p-1.5 cursor-pointer z-10"
              >
                <FiX size={20} />
              </button>

              {/* Product Gallery (Left) */}
              <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] overflow-hidden bg-gray-100 border border-[var(--border-color)] shrink-0">
                <img 
                  src={quickViewProduct.image || quickViewProduct.images?.[0]?.url} 
                  alt={quickViewProduct.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Product details (Right) */}
              <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] bg-gold/15 text-gold border border-gold/20 px-2 py-0.5 font-bold uppercase tracking-widest rounded-sm">
                      {quickViewProduct.category}
                    </span>
                    <h3 className="text-xl font-bold uppercase tracking-wider text-[var(--text-color)] mt-2">
                      {quickViewProduct.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-bold text-gold font-sans">
                        ${quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price ? quickViewProduct.discountPrice : quickViewProduct.price}
                      </span>
                      {quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price && (
                        <span className="text-xs line-through text-gray-500 font-sans">
                          ${quickViewProduct.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  {/* Colors selector */}
                  {quickViewProduct.colors?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color:</span>
                      <div className="flex gap-1.5">
                        {quickViewProduct.colors.map(col => (
                          <button
                            key={col}
                            onClick={() => setQvColor(col)}
                            style={{ backgroundColor: col }}
                            className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-105 ${qvColor === col ? 'border-gold scale-105' : 'border-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes selector */}
                  {quickViewProduct.sizes?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size:</span>
                      <div className="flex gap-1.5">
                        {quickViewProduct.sizes.map(sz => (
                          <button
                            key={sz}
                            onClick={() => setQvSize(sz)}
                            className={`w-8 h-8 border text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${qvSize === sz ? 'border-gold bg-gold/10 text-gold' : 'border-[var(--border-color)] hover:border-gray-400'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Qty & Add button */}
                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-center border border-[var(--border-color)] h-11 w-24 shrink-0">
                    <button onClick={() => setQvQty(p => Math.max(1, p - 1))} className="w-7 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FiMinus size={10}/></button>
                    <span className="flex-grow text-center font-bold text-xs font-sans">{qvQty}</span>
                    <button onClick={() => setQvQty(p => p + 1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FiPlus size={10}/></button>
                  </div>

                  <button
                    onClick={handleQvAddToCart}
                    className="flex-grow h-11 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-gold/25"
                  >
                    <FiShoppingBag size={12} /> Add to Cart
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Shop;
