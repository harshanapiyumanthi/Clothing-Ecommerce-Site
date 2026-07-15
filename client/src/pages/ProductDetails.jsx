import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMinus, FiPlus, FiStar, FiSliders, FiInfo, FiCheck, FiX, FiShoppingBag, FiArrowRight, FiEye } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load product from database
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Dream Dress Studio state
  const [showStudio, setShowStudio] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const availableStudioOptions = {
    fabric: [
      { name: 'Standard Cotton', price: 0 },
      { name: 'Premium Linen', price: 15 },
      { name: 'Georgette Silk', price: 30 },
      { name: 'Silk Velvet', price: 45 }
    ],
    sleeve: [
      { name: 'Standard', price: 0 },
      { name: 'Sleeveless', price: 0 },
      { name: 'Puff Sleeves', price: 10 },
      { name: 'Long Elegant', price: 15 }
    ],
    neckline: [
      { name: 'Standard', price: 0 },
      { name: 'V-Neck', price: 0 },
      { name: 'Sweetheart', price: 15 },
      { name: 'Off-shoulder', price: 20 }
    ],
    decorations: [
      { name: 'None', price: 0 },
      { name: 'Pearl Embroidery', price: 40 },
      { name: 'Lace Trim', price: 25 },
      { name: 'Crystal Sequence', price: 60 }
    ]
  };

  const [studioSelections, setStudioSelections] = useState({
    fabric: availableStudioOptions.fabric[0],
    sleeve: availableStudioOptions.sleeve[0],
    neckline: availableStudioOptions.neckline[0],
    decorations: availableStudioOptions.decorations[0]
  });
  
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);

  // Complete The Look outfit state
  const [accessories, setAccessories] = useState([]);
  const [outfitItems, setOutfitItems] = useState([]);

  // Reviews & ratings state
  const [reviewsList, setReviewsList] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewedList, setRecentlyViewedList] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [alsoBought, setAlsoBought] = useState([]);

  const trackBackendInteraction = async (prodId, type) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      if (userInfo && userInfo.token) {
        await axios.post('http://localhost:5000/api/recommendations/track', {
          productId: prodId,
          type
        }, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
      }
    } catch (err) {
      // track interaction errors silently
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const productsList = JSON.parse(localStorage.getItem('admin_products') || '[]');
      let found = productsList.find(p => p.id.toString() === id.toString());
      if (!found) {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${id}`);
          if (response.data && response.data.success) {
            found = response.data.product;
          }
        } catch (err) {
          console.warn('Failed to fetch product from server', err.message);
        }
      }
      if (!found) {
        found = productsList[0] || {
          id: 'prod-1',
          name: 'Silk Evening Gown',
          price: 299,
          description: 'An exquisite silk evening gown designed for elegance and comfort. Features a flowing silhouette and delicate detailing.',
          rating: 4.8,
          reviews: 124,
          category: 'Women',
          stock: 5,
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['#0f172a', '#b45309', '#be123c'],
          images: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=2071&auto=format&fit=crop' }]
        };
      }
      setProduct(found);
      if (found.colors?.length > 0) {
        setSelectedColor(found.colors[0]);
      }

      // Track view interaction on backend
      trackBackendInteraction(found.id, 'view');

      // Log to recently viewed
      if (found && found.id) {
        let rv = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        rv = rv.filter(item => item.toString() !== found.id.toString());
        rv.unshift(found.id);
        localStorage.setItem('recently_viewed', JSON.stringify(rv.slice(0, 8)));
      }

      // Load reviews
      const savedReviews = JSON.parse(localStorage.getItem(`product_reviews_${found.id}`) || '[]');
      setReviewsList(savedReviews);

      // Load Complete Your Look Recommendations
      if (found.recommendations && found.recommendations.length > 0) {
        // filter out stock === 0
        const availableRecs = found.recommendations.filter(r => r.stock !== 0);
        setAccessories(availableRecs);
      } else {
        // Fallback mock recommendations if none assigned
        const recs = JSON.parse(localStorage.getItem('admin_recommendations') || '[]');
        const prodRec = recs.find(r => r.productId.toString() === id.toString());
        let matchedAccs = [];
        if (prodRec && prodRec.assignedProducts?.length > 0) {
          matchedAccs = productsList.filter(p => prodRec.assignedProducts.includes(p.id) && p.stock !== 0);
        } else {
          matchedAccs = productsList.filter(p => (p.category === 'Accessories' || p.category?.name === 'Accessories') && p.stock !== 0).slice(0, 3);
        }
        setAccessories(matchedAccs);
      }

      // Load related products
      try {
        const response = await axios.get(`http://localhost:5000/api/recommendations/similar/${id}`);
        if (response.data && response.data.success) {
          setRelatedProducts(response.data.products);
        } else {
          throw new Error('No similar products');
        }
      } catch (err) {
        const related = productsList
          .filter(p => (p.category === found.category || p.category?.name === found.category?.name) && p.id.toString() !== found.id.toString())
          .slice(0, 4);
        setRelatedProducts(related);
      }

      // Load frequently bought together
      try {
        const response = await axios.get(`http://localhost:5000/api/recommendations/bought-together/${id}`);
        if (response.data && response.data.success) {
          setFrequentlyBought(response.data.products);
        } else {
          throw new Error('No bought together products');
        }
      } catch (err) {
        const fbt = productsList
          .filter(p => p.id.toString() !== found.id.toString())
          .slice(0, 4);
        setFrequentlyBought(fbt);
      }

      // Load customers also bought
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        const headers = userInfo && userInfo.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
        const response = await axios.get(`http://localhost:5000/api/recommendations`, headers);
        if (response.data && response.data.success) {
          setAlsoBought(response.data.products);
        } else {
          throw new Error('No recommendations');
        }
      } catch (err) {
        const ab = productsList
          .filter(p => p.id.toString() !== found.id.toString())
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        setAlsoBought(ab);
      }

      // Load recently viewed products
      const rvIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      const rvMatched = rvIds
        .filter(x => x.toString() !== found.id.toString())
        .map(rid => productsList.find(p => p.id.toString() === rid.toString()))
        .filter(Boolean)
        .slice(0, 4);
      setRecentlyViewedList(rvMatched);

      setActiveImageIndex(0);
      setLoading(false);
    };

    loadData();
  }, [id]);



  const getCustomSurcharge = () => {
    let extra = 0;
    if (showStudio) {
      extra += studioSelections.fabric.price;
      extra += studioSelections.sleeve.price;
      extra += studioSelections.neckline.price;
      extra += studioSelections.decorations.price;
    }
    return extra;
  };

  const handleSaveDesign = async () => {
    if (!userInfo || userInfo.membershipTier !== 'Premium') return;
    try {
      const customizations = [
        { optionType: 'Fabric', optionValue: studioSelections.fabric.name },
        { optionType: 'Sleeve', optionValue: studioSelections.sleeve.name },
        { optionType: 'Neckline', optionValue: studioSelections.neckline.name },
        { optionType: 'Decoration', optionValue: studioSelections.decorations.name },
      ];
      const payload = {
        productId: product.id || product._id,
        customizations,
        totalPrice: product.price + getCustomSurcharge(),
        productionTime: (product.baseProductionTime || 2) + 7,
      };
      const headers = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/saved-designs', payload, headers);
      toast.success('Design saved to your Dream Dress Studio Collection!');
    } catch (err) {
      toast.error('Failed to save design. Please try again.');
    }
  };

  const handleAddMainToCart = () => {
    // Auth check before adding to cart
    if (!userInfo) {
      toast.warning('Please log in or register to add items to your cart.');
      navigate('/login');
      return;
    }

    const isCustom = showStudio;
    const finalPrice = isCustom ? product.price + getCustomSurcharge() : product.price;
    const itemId = isCustom ? `${product.id}-custom-${Date.now()}` : product.id;

    const customizationData = isCustom ? {
      fabric: studioSelections.fabric.name,
      sleeve: studioSelections.sleeve.name,
      neckline: studioSelections.neckline.name,
      decorations: studioSelections.decorations.name,
      standardSize: selectedSize,
      productionTime: `${(product.baseProductionTime || 2) + 7} Days`
    } : null;

    dispatch(addToCart({
      id: itemId,
      productId: product.id,
      name: product.name + (isCustom ? ' (Bespoke Custom)' : ''),
      price: finalPrice,
      basePrice: product.price,
      image: product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80',
      qty,
      size: isCustom && useCustomMeasurements ? 'Custom' : selectedSize,
      color: selectedColor,
      isCustom,
      customization: customizationData
    }));

    toast.success(`${product.name} added to cart!`);
    trackBackendInteraction(product.id, 'cart');

  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error('This product is currently out of stock.');
      return;
    }

    if (!selectedSize && !showCustomizer && product.sizes?.length > 0) {
      toast.warning('Please select a size before purchasing.');
      return;
    }

    const isCustom = showCustomizer && product.category !== 'Accessories';
    let itemId = product.id;
    if (isCustom) {
      itemId = `${product.id}-custom-${Date.now()}`;
    } else {
      itemId = `${product.id}-${selectedSize}-${selectedColor}`;
    }

    const finalPrice = isCustom ? product.price + getCustomSurcharge() : product.price;
    const customizationData = isCustom ? {
      fabric,
      pattern,
      color: selectedColor,
      customColor,
      neckDesign,
      sleeveDesign,
      dressLength,
      fit,
      buttons,
      sizeType,
      standardSize,
      measurements: sizeType === 'Custom' ? measurements : null,
      pinterestUrl,
      referenceImageUrl,
      sketchUrl,
      inspirationUrl,
      specialInstructions,
      productionTime: '5 weeks'
    } : null;

    dispatch(addToCart({
      id: itemId,
      productId: product.id,
      name: product.name + (isCustom ? ' (Bespoke Custom)' : ''),
      price: finalPrice,
      basePrice: product.price,
      image: product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80',
      qty,
      size: isCustom && sizeType === 'Custom' ? 'Custom' : selectedSize,
      color: selectedColor,
      isCustom,
      customization: customizationData
    }));

    toast.success('Redirecting to secure checkout...');
    trackBackendInteraction(product.id, 'buy_now');
    navigate('/checkout');
  };

  const handleAddOutfitItem = (acc) => {
    if (outfitItems.find(item => item.id === acc.id || item.id === acc._id)) {
      setOutfitItems(outfitItems.filter(item => item.id !== (acc.id || acc._id)));
    } else {
      setOutfitItems([...outfitItems, acc]);
    }
  };

  const handleAddEntireOutfit = () => {
    if (outfitItems.length === 0) return;
    
    outfitItems.forEach(acc => {
      dispatch(addToCart({
        id: acc.id || acc._id,
        productId: acc.id || acc._id,
        name: acc.name,
        price: acc.discountPrice || acc.price,
        image: acc.images?.[0]?.url || acc.images?.[0] || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80',
        qty: 1,
        size: acc.sizes?.[0] || 'One Size',
        color: acc.colors?.[0] || 'Neutral',
        isCustom: false
      }));
    });
    
    toast.success('Your complete outfit has been added to the cart!');
    setOutfitItems([]);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      name: userInfo?.name || 'Anonymous Guest',
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toLocaleDateString()
    };
    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    localStorage.setItem(`product_reviews_${product.id}`, JSON.stringify(updated));
    setNewReviewText('');
    toast.success('Thank you for your premium rating review!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  // Surcharge calculation
  const currentPrice = showCustomizer ? product.price + getCustomSurcharge() : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative space-y-8">
      <Breadcrumb items={[{ label: 'Shop', link: '/shop' }, { label: product.name, link: `/product/${product.id}` }]} />
      
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Product Images */}
        <div className="w-full lg:w-1/2 flex gap-4">
          <div className="flex flex-col gap-4 w-24">
            {(product.images && product.images.length > 0 ? product.images : [{ url: product.image }]).map((img, i) => (
              <div 
                key={i} 
                onClick={() => setActiveImageIndex(i)}
                className={`h-32 bg-gray-150 cursor-pointer border transition-colors ${activeImageIndex === i ? 'border-gold shadow-sm' : 'border-[var(--border-color)] hover:border-gold'}`}
              >
                <img src={img.url || img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex-grow bg-gray-150 h-[500px] sm:h-[600px] overflow-hidden group border border-[var(--border-color)] relative">
            <img 
              src={(product.images && product.images.length > 0 ? product.images : [{ url: product.image }])[activeImageIndex]?.url || (product.images && product.images.length > 0 ? product.images : [{ url: product.image }])[activeImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-cover origin-center transition-transform duration-350 hover:scale-125 cursor-zoom-in" 
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
          
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-[var(--text-color)]">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => <FiStar key={i} fill={i < Math.round(product.rating || 4.5) ? 'currentColor' : 'none'} size={15} />)}
              </div>
              <span className="text-xs opacity-65">({reviewsList.length > 0 ? reviewsList.length : 124} Reviews)</span>
              
              {/* Inventory stock alert warning */}
              {product.stock !== undefined && product.stock > 0 && product.stock < 10 ? (
                <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 text-[9px] font-extrabold tracking-widest px-2.5 py-0.5 rounded uppercase animate-pulse">
                  Only {product.stock} left in stock!
                </span>
              ) : product.stock === 0 ? (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[9px] font-extrabold tracking-widest px-2.5 py-0.5 rounded uppercase">
                  Out of Stock
                </span>
              ) : null}
            </div>
          </div>
          
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gold font-sans">${currentPrice}</span>
            {product.discountPrice && product.discountPrice < product.price && !showCustomizer && (
              <span className="text-sm line-through opacity-55 font-sans">${product.price}</span>
            )}
          </div>
          
          <p className="text-sm text-gray-650 dark:text-gray-400 leading-relaxed">{product.description}</p>
          
          {/* Colors Selection */}
          <div className="pt-4 border-t border-[var(--border-color)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Color</h3>
            <div className="flex gap-2">
              {product.colors?.map(color => (
                <button 
                  key={color} 
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${selectedColor === color ? 'border-gold scale-105' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Sizes Selection */}
          {!showCustomizer && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Size</h3>
              <div className="flex gap-2">
                {product.sizes?.map(size => (
                  <button 
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 border text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${selectedSize === size ? 'border-gold bg-gold/10 text-gold' : 'border-[var(--border-color)] hover:border-gray-400'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons (Add and Customize triggers) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center border border-[var(--border-color)] h-12 w-28 shrink-0">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-full flex items-center justify-center hover:bg-gray-150 transition-colors"><FiMinus size={12}/></button>
              <span className="flex-grow text-center font-bold text-sm font-sans">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-150 transition-colors"><FiPlus size={12}/></button>
            </div>
            
            <button 
              type="button"
              onClick={handleAddMainToCart}
              className="flex-grow h-12 bg-white text-black border-2 border-black hover:bg-black hover:text-white uppercase tracking-wider font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-black/10 cursor-pointer"
            >
              <FiShoppingBag /> Add to Cart
            </button>
            
            <button 
              type="button"
              onClick={handleBuyNow}
              className="flex-grow h-12 bg-gold hover:bg-black text-white uppercase tracking-wider font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-gold/25 cursor-pointer"
            >
              Buy Now
            </button>

            {product.isPersonalizable && (
              <button 
                type="button"
                onClick={() => {
                  if (userInfo?.membershipTier === 'Premium') {
                    setShowStudio(!showStudio);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`flex-grow h-12 border uppercase tracking-wider font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${showStudio ? 'bg-black border-black text-white' : 'bg-gold/10 border-gold text-gold hover:bg-gold hover:text-white shadow-md'}`}
              >
                <span className="text-sm">✨</span> 
                {showStudio ? 'Cancel Personalization' : 'Personalize This Design'}
              </button>
            )}
          </div>

          {/* Dream Dress Studio Panel */}
          <AnimatePresence>
            {showStudio && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border border-gold/45 bg-[var(--card-bg)] shadow-lg p-6 rounded-lg space-y-6 mt-4 relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20"></div>
                
                <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                  <div>
                    <h4 className="font-bold text-lg uppercase tracking-widest text-gold flex items-center gap-2">
                      ✨ Dream Dress Studio
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Personalize our designer collections to match your unique style.</p>
                  </div>
                  <button 
                    onClick={handleSaveDesign}
                    className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-gold transition-colors"
                  >
                    Save Design
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Fabric Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Fabric Selection</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableStudioOptions.fabric.map(opt => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setStudioSelections(prev => ({ ...prev, fabric: opt }))}
                          className={`p-2 border rounded text-xs text-left transition-all ${studioSelections.fabric.name === opt.name ? 'border-gold bg-gold/10 font-bold text-gold' : 'border-[var(--border-color)] hover:border-gold/50'}`}
                        >
                          {opt.name} {opt.price > 0 && <span className="text-[10px] opacity-70 ml-1">(+${opt.price})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sleeve Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Sleeve Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableStudioOptions.sleeve.map(opt => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setStudioSelections(prev => ({ ...prev, sleeve: opt }))}
                          className={`p-2 border rounded text-xs text-left transition-all ${studioSelections.sleeve.name === opt.name ? 'border-gold bg-gold/10 font-bold text-gold' : 'border-[var(--border-color)] hover:border-gold/50'}`}
                        >
                          {opt.name} {opt.price > 0 && <span className="text-[10px] opacity-70 ml-1">(+${opt.price})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Neckline Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Neckline Design</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableStudioOptions.neckline.map(opt => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setStudioSelections(prev => ({ ...prev, neckline: opt }))}
                          className={`p-2 border rounded text-xs text-left transition-all ${studioSelections.neckline.name === opt.name ? 'border-gold bg-gold/10 font-bold text-gold' : 'border-[var(--border-color)] hover:border-gold/50'}`}
                        >
                          {opt.name} {opt.price > 0 && <span className="text-[10px] opacity-70 ml-1">(+${opt.price})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Decorations Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Decorations</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableStudioOptions.decorations.map(opt => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setStudioSelections(prev => ({ ...prev, decorations: opt }))}
                          className={`p-2 border rounded text-xs text-left transition-all ${studioSelections.decorations.name === opt.name ? 'border-gold bg-gold/10 font-bold text-gold' : 'border-[var(--border-color)] hover:border-gold/50'}`}
                        >
                          {opt.name} {opt.price > 0 && <span className="text-[10px] opacity-70 ml-1">(+${opt.price})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Estimates */}
                <div className="pt-4 border-t border-gold/15 flex flex-col gap-2 text-xs text-gray-600 font-semibold bg-gold/5 p-4 rounded mt-4">
                  <div className="flex justify-between items-center">
                    <span className="uppercase tracking-widest text-[10px] text-gray-500">Base Designer Price:</span>
                    <span className="font-sans text-gray-800 dark:text-gray-300 text-sm">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gold">
                    <span className="uppercase tracking-widest text-[10px]">Studio Surcharge:</span>
                    <span className="font-sans">+${getCustomSurcharge().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gold/20 pt-2 font-bold text-[var(--text-color)] text-lg">
                    <span className="uppercase tracking-widest text-[10px]">Total Studio Price:</span>
                    <span className="font-sans text-gold">${(product.price + getCustomSurcharge()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-2 border-t border-dashed border-[var(--border-color)] pt-2 uppercase tracking-widest">
                    <span>Estimated Production:</span>
                    <span>{(product.baseProductionTime || 2) + 7} Days</span>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Membership Upgrade Modal */}
          <AnimatePresence>
            {showUpgradeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[var(--card-bg)] border border-gold/30 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden"
                >
                  <div className="bg-black text-center py-8 relative">
                    <button 
                      onClick={() => setShowUpgradeModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
                    >
                      <FiX size={20} />
                    </button>
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-gold font-sans mb-2">Unlock Dream Dress Studio</h3>
                    <p className="text-xs text-gray-300 px-8">Personalize our designer collections to perfection with exclusive access.</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <ul className="space-y-4">
                      {[
                        'Personalize our original designer collections',
                        'Access exclusive premium fabrics and silks',
                        'Unlock luxury color palettes and decorations',
                        'Save your personalized designs for later',
                        'Priority production and tailoring (Skip the line)',
                        'Early access to new seasonal collections'
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-color)]">
                          <div className="bg-gold/20 text-gold p-1 rounded-full shrink-0">
                            <FiCheck size={14} />
                          </div>
                          <span className="leading-tight pt-0.5">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-[var(--border-color)] text-center">
                      <Link 
                        to="/membership" 
                        className="inline-block w-full py-3.5 bg-gold text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-black transition-colors shadow-lg"
                      >
                        Upgrade to Premium Now
                      </Link>
                      <button 
                        onClick={() => setShowUpgradeModal(false)}
                        className="mt-4 text-xs text-gray-400 hover:text-gold uppercase tracking-wider font-bold"
                      >
                        Continue as Standard Guest
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ✨ Complete Your Look Section */}
      {accessories.length > 0 && (
        <section className="mt-12 pt-12 border-t border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)] flex items-center gap-3">
                <span className="text-gold">✨</span> Complete Your Look
              </h3>
              <p className="text-sm text-gray-500">We've selected matching items to complete your outfit.</p>
            </div>
            
            {/* Your Outfit Builder Summary Bar */}
            <AnimatePresence>
              {outfitItems.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-gold/10 border border-gold/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-lg"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Your Outfit ({outfitItems.length} items)</span>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {outfitItems.map(item => (
                          <img 
                            key={item.id || item._id} 
                            src={item.images?.[0]?.url || item.images?.[0]} 
                            alt={item.name}
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            title={item.name}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold ml-2">
                        Total: <span className="text-gold font-sans">${outfitItems.reduce((acc, curr) => acc + (curr.discountPrice || curr.price), 0).toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleAddEntireOutfit}
                    className="bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg transition-colors shadow-md whitespace-nowrap"
                  >
                    Add Outfit to Cart
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar snap-x">
            {accessories.map((acc) => (
              <div 
                key={acc.id || acc._id} 
                className="snap-start shrink-0 w-64 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-xl transition-shadow group flex flex-col"
              >
                <div className="relative h-72 bg-gray-150">
                  <img 
                    src={acc.images?.[0]?.url || acc.images?.[0] || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80'} 
                    alt={acc.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <Link
                      to={`/product/${acc.id || acc._id}`}
                      className="p-3 bg-white text-gray-900 rounded-full hover:bg-gold hover:text-white transition-colors shadow"
                      title="Quick View"
                    >
                      <FiEye size={20} />
                    </Link>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-bold text-sm text-[var(--text-color)] line-clamp-1">{acc.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{acc.category?.name || acc.category}</p>
                  
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="font-bold text-gold font-sans">${acc.discountPrice || acc.price}</span>
                    <button 
                      onClick={() => handleAddOutfitItem(acc)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors ${
                        outfitItems.find(item => item.id === (acc.id || acc._id)) 
                          ? 'bg-gold/20 text-gold border border-gold/40' 
                          : 'bg-black text-white hover:bg-gold'
                      }`}
                    >
                      {outfitItems.find(item => item.id === (acc.id || acc._id)) ? 'Selected' : 'Add to Outfit'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuideModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border border-[var(--border-color)] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSizeGuideModal(false)}
                className="absolute top-4 right-4 text-gray-550 hover:text-gold p-1.5 cursor-pointer z-10"
              >
                <FiX size={20} />
              </button>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center">GFLOCK Size Guide</h3>
                <div className="h-0.5 w-16 bg-gold mx-auto mb-4"></div>
                
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  All measurements listed below are in inches. Select the standard size that fits your silhouette, or submit custom tailoring specs.
                </p>
                
                <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
                  <table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gold/10 text-gold font-bold uppercase border-b border-[var(--border-color)]">
                        <th className="p-3">Size</th>
                        <th className="p-3">Bust (in)</th>
                        <th className="p-3">Waist (in)</th>
                        <th className="p-3">Hip (in)</th>
                        <th className="p-3">UK Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {[
                        { size: 'XS', bust: '32', waist: '25', hip: '35', uk: '6' },
                        { size: 'S', bust: '34', waist: '27', hip: '37', uk: '8' },
                        { size: 'M', bust: '36', waist: '29', hip: '39', uk: '10' },
                        { size: 'L', bust: '38', waist: '31', hip: '41', uk: '12' },
                        { size: 'XL', bust: '40', waist: '33', hip: '43', uk: '14' },
                        { size: 'XXL', bust: '42', waist: '35', hip: '45', uk: '16' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-3 font-semibold">{row.size}</td>
                          <td className="p-3 font-mono">{row.bust}</td>
                          <td className="p-3 font-mono">{row.waist}</td>
                          <td className="p-3 font-mono">{row.hip}</td>
                          <td className="p-3 font-mono">{row.uk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Reviews & Rating section */}
      <section className="border-t border-[var(--border-color)] pt-16 mt-16 space-y-12">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-widest">Customer Reviews</h3>
          <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Verified Reviews ({reviewsList.length})</h4>
            {reviewsList.length === 0 ? (
              <p className="text-xs text-gray-400 py-6">No reviews have been written for this product yet. Be the first to share your thoughts!</p>
            ) : (
              <div className="space-y-6">
                {reviewsList.map(rev => (
                  <div key={rev.id} className="border-b border-[var(--border-color)] pb-6 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[var(--text-color)]">{rev.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 text-gold">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className="text-gray-500 leading-relaxed max-w-xl">{rev.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Form */}
          <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider">Share Your Thoughts</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              
              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-500">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewReviewRating(val)}
                      className={`h-8 w-8 rounded border flex items-center justify-center transition-colors cursor-pointer ${newReviewRating === val ? 'bg-gold border-gold text-white' : 'border-[var(--border-color)] hover:border-gold hover:text-gold'}`}
                    >
                      <FiStar size={14} fill={newReviewRating >= val ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-500">Your Review</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your purchase: sizing details, fabric feel, or design accuracy..."
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  className="w-full border border-[var(--border-color)] bg-transparent p-3 outline-none focus:border-gold rounded-lg resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold hover:bg-black text-white font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 1. Perfect Matches / Complete the Look */}
      {accessories.length > 0 && (
        <section className="border-t border-[var(--border-color)] pt-16 mt-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2.5 py-1 rounded-full">Perfect Matches</span>
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)] mt-2">Complete the Look</h3>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {accessories.slice(0, 4).map(prod => (
              <AnimatedProductCard key={prod.id || prod._id} prod={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <section className="border-t border-[var(--border-color)] pt-16 mt-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2.5 py-1 rounded-full">Atelier Bundle</span>
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)] mt-2">Frequently Bought Together</h3>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {frequentlyBought.slice(0, 4).map(prod => (
              <AnimatedProductCard key={prod.id || prod._id} prod={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Customers Also Bought */}
      {alsoBought.length > 0 && (
        <section className="border-t border-[var(--border-color)] pt-16 mt-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2.5 py-1 rounded-full">Popular Selection</span>
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)] mt-2">Customers Also Bought</h3>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {alsoBought.slice(0, 4).map(prod => (
              <AnimatedProductCard key={prod.id || prod._id} prod={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[var(--border-color)] pt-16 mt-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2.5 py-1 rounded-full">Similar Silhouette</span>
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)] mt-2">Related Products</h3>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <AnimatedProductCard key={prod.id || prod._id} prod={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Recently Viewed */}
      {recentlyViewedList.length > 0 && (
        <section className="border-t border-[var(--border-color)] pt-16 mt-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2.5 py-1 rounded-full">Your History</span>
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)] mt-2">Recently Viewed</h3>
            <div className="h-0.5 w-16 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recentlyViewedList.map(prod => (
              <AnimatedProductCard key={prod.id || prod._id} prod={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

const AnimatedProductCard = ({ prod }) => {
  const imgUrl = prod.images?.[0]?.url || prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80';
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group flex flex-col space-y-2 bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="relative h-64 overflow-hidden bg-gray-150 rounded-lg">
        <img 
          src={imgUrl} 
          alt={prod.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {/* Quick details overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link
            to={`/product/${prod.id || prod._id}`}
            className="p-2.5 bg-white text-gray-900 rounded-full hover:bg-gold hover:text-white transition-colors shadow"
          >
            <FiEye size={16} />
          </Link>
        </div>
      </div>
      <div className="pt-2">
        <h3 className="font-bold text-xs text-[var(--text-color)] line-clamp-1 group-hover:text-gold transition-colors">{prod.name}</h3>
        <p className="text-[10px] text-gray-400 mt-0.5">{prod.brand || 'Atelier Collection'}</p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border-color)]">
          <p className="text-xs font-bold text-gold font-sans">${prod.discountPrice || prod.price}</p>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">
            {typeof prod.category === 'object' ? prod.category.name : prod.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
