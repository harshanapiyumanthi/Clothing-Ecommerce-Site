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
  
  // Customization state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [fabric, setFabric] = useState('Georgette Silk');
  const [customColor, setCustomColor] = useState('');
  const [pattern, setPattern] = useState('Solid');
  const [neckDesign, setNeckDesign] = useState('Boat Neck');
  const [sleeveDesign, setSleeveDesign] = useState('Short Sleeves');
  const [dressLength, setDressLength] = useState('Midi');
  const [fit, setFit] = useState('Regular Fit');
  const [buttons, setButtons] = useState('None');
  const [useCustomMeasurements, setUseCustomMeasurements] = useState(false);
  
  // Custom measurements
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [neckSize, setNeckSize] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [armHole, setArmHole] = useState('');
  const [dressLengthCustom, setDressLengthCustom] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  
  // Upload references
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [inspirationUrl, setInspirationUrl] = useState('');
  const [sketchUrl, setSketchUrl] = useState('');
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
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
    if (fabric === 'Silk Velvet') extra += 40;
    else if (fabric === 'Georgette Silk') extra += 20;
    else if (fabric === 'Merino Wool') extra += 30;
    else if (fabric === 'Premium Cotton') extra += 10;
    else if (fabric === 'Heavy Duty Linen') extra += 15;

    if (sleeveDesign === 'Puff Sleeves') extra += 10;
    else if (sleeveDesign === 'Long Sleeves') extra += 15;
    else if (sleeveDesign === 'Three-Quarter') extra += 10;

    if (buttons === 'Pearl Buttons') extra += 15;
    else if (buttons === 'Metallic Buttons') extra += 10;
    else if (buttons === 'Wooden Buttons') extra += 5;

    if (useCustomMeasurements) extra += 30;
    return extra;
  };

  const handleAddMainToCart = () => {
    // Auth check before adding to cart
    if (!userInfo) {
      toast.warning('Please log in or register to add items to your cart.');
      navigate('/login');
      return;
    }

    // If user selected custom measurements, validate them
    if (showCustomizer && useCustomMeasurements) {
      if (!bust || !waist || !hip || !shoulder || !neckSize || !sleeveLength || !armHole || !dressLengthCustom || !height || !weight) {
        toast.warning('Please fill in all custom measurements.');
        return;
      }
    }

    const isCustom = showCustomizer;
    const finalPrice = isCustom ? product.price + getCustomSurcharge() : product.price;
    const itemId = isCustom ? `${product.id}-custom-${Date.now()}` : product.id;

    const customizationData = isCustom ? {
      fabric,
      color: customColor || selectedColor,
      pattern,
      neckDesign,
      sleeveDesign,
      dressLength,
      fit,
      buttons,
      sizeType: useCustomMeasurements ? 'Custom' : 'Standard',
      standardSize: useCustomMeasurements ? null : selectedSize,
      measurements: useCustomMeasurements ? { 
        bust, 
        waist, 
        hip, 
        shoulder, 
        neck: neckSize, 
        sleeveLength, 
        armHole, 
        dressLength: dressLengthCustom, 
        height, 
        weight 
      } : null,
      referenceImageUrl,
      inspirationUrl,
      sketchUrl,
      pinterestUrl,
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

            {product.category !== 'Accessories' && (
              <button 
                type="button"
                onClick={() => setShowCustomizer(!showCustomizer)}
                className={`flex-grow h-12 border uppercase tracking-wider font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${showCustomizer ? 'bg-black border-black text-white' : 'border-gold text-gold hover:bg-gold/10'}`}
              >
                <FiSliders /> {showCustomizer ? 'Cancel Customization' : 'Customize This Dress'}
              </button>
            )}
          </div>

          {/* Customizer Panel */}
          <AnimatePresence>
            {showCustomizer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border border-gold/45 bg-gold/5 p-5 rounded-lg space-y-4 pt-4 mt-2"
              >
                <div className="flex items-center gap-2 border-b border-gold/20 pb-2">
                  <FiSliders className="text-gold" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gold">Tailoring & Custom Specs</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fabric */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Fabric Option</label>
                    <select
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Georgette Silk">Georgette Silk (+$20)</option>
                      <option value="Heavy Duty Linen">Heavy Duty Linen (+$15)</option>
                      <option value="Premium Cotton">Premium Cotton (+$10)</option>
                      <option value="Silk Velvet">Silk Velvet (+$40)</option>
                      <option value="Merino Wool">Merino Wool (+$30)</option>
                    </select>
                  </div>

                  {/* Pattern */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Pattern Option</label>
                    <select
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Solid">Solid (+$0)</option>
                      <option value="Floral">Floral (+$15)</option>
                      <option value="Stripes">Stripes (+$10)</option>
                      <option value="Polka Dots">Polka Dots (+$10)</option>
                      <option value="Plaid">Plaid (+$15)</option>
                    </select>
                  </div>

                  {/* Custom color input */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Color Selection</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['#0f172a', '#b45309', '#be123c', '#000000', '#ffffff', '#f5f5dc', '#10b981', '#ef4444'].map((col, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedColor(col);
                            setCustomColor('');
                          }}
                          style={{ backgroundColor: col }}
                          className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${selectedColor === col && !customColor ? 'border-gold scale-105' : 'border-transparent'}`}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or specify custom color name..."
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold"
                    />
                  </div>

                  {/* Neck design */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Neckline Design</label>
                    <select
                      value={neckDesign}
                      onChange={(e) => setNeckDesign(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Boat Neck">Boat Neck</option>
                      <option value="Sweetheart">Sweetheart</option>
                      <option value="V-Neck">V-Neck</option>
                      <option value="Crew Neck">Crew Neck</option>
                      <option value="Halter Neck">Halter Neck</option>
                      <option value="Off-shoulder">Off-shoulder</option>
                    </select>
                  </div>

                  {/* Sleeve design */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Sleeve Option</label>
                    <select
                      value={sleeveDesign}
                      onChange={(e) => setSleeveDesign(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Short Sleeves">Short Sleeves (+$0)</option>
                      <option value="Sleeveless">Sleeveless (+$0)</option>
                      <option value="Puff Sleeves">Puff Sleeves (+$10)</option>
                      <option value="Three-Quarter">Three-Quarter (+$10)</option>
                      <option value="Long Sleeves">Long Sleeves (+$15)</option>
                      <option value="Bell Sleeves">Bell Sleeves (+$15)</option>
                    </select>
                  </div>

                  {/* Length */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Dress Length</label>
                    <select
                      value={dressLength}
                      onChange={(e) => setDressLength(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Midi">Midi</option>
                      <option value="Mini">Mini</option>
                      <option value="Knee Length">Knee Length</option>
                      <option value="Maxi">Maxi</option>
                      <option value="Floor Length">Floor Length</option>
                    </select>
                  </div>

                  {/* Fit */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Posture & Fit</label>
                    <select
                      value={fit}
                      onChange={(e) => setFit(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Regular Fit">Regular Fit</option>
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Loose Fit">Loose Fit</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Buttons Selection</label>
                    <select
                      value={buttons}
                      onChange={(e) => setButtons(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="None">None (+$0)</option>
                      <option value="Pearl Buttons">Pearl Buttons (+$15)</option>
                      <option value="Metallic Buttons">Metallic Buttons (+$10)</option>
                      <option value="Wooden Buttons">Wooden Buttons (+$5)</option>
                      <option value="Fabric Buttons">Fabric Buttons (+$10)</option>
                    </select>
                  </div>
                </div>

                {/* Sizing selection */}
                <div className="space-y-3 pt-4 border-t border-gold/15">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="text-xs font-bold uppercase text-gray-500">Sizing Type</label>
                    <div className="flex gap-2">
                      <button
                        key="standard"
                        type="button"
                        onClick={() => setUseCustomMeasurements(false)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${!useCustomMeasurements ? 'bg-gold text-white shadow' : 'border border-gold/40 text-gold hover:bg-gold/10'}`}
                      >
                        Standard Size
                      </button>
                      <button
                        key="custom"
                        type="button"
                        onClick={() => setUseCustomMeasurements(true)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${useCustomMeasurements ? 'bg-gold text-white shadow' : 'border border-gold/40 text-gold hover:bg-gold/10'}`}
                      >
                        Custom Measurements (+$30)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSizeGuideModal(true)}
                      className="text-[10px] text-gold underline cursor-pointer hover:text-black font-bold uppercase tracking-wider ml-auto"
                    >
                      Size Guide
                    </button>
                  </div>

                  {!useCustomMeasurements ? (
                    <div className="flex items-center gap-2 pt-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Standard Size:</span>
                      <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`w-8 h-8 text-xs font-bold border transition-colors ${selectedSize === sz ? 'bg-gold border-gold text-white' : 'border-[var(--border-color)] text-gray-600 hover:border-gold'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gold/5 p-4 rounded border border-gold/15">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Bust (in)</label>
                        <input type="number" placeholder="e.g. 34" value={bust} onChange={e => setBust(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Waist (in)</label>
                        <input type="number" placeholder="e.g. 28" value={waist} onChange={e => setWaist(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Hip (in)</label>
                        <input type="number" placeholder="e.g. 36" value={hip} onChange={e => setHip(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Shoulder (in)</label>
                        <input type="number" placeholder="e.g. 15" value={shoulder} onChange={e => setShoulder(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Neck Size (in)</label>
                        <input type="number" placeholder="e.g. 13" value={neckSize} onChange={e => setNeckSize(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Sleeve Length (in)</label>
                        <input type="number" placeholder="e.g. 22" value={sleeveLength} onChange={e => setSleeveLength(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Arm Hole (in)</label>
                        <input type="number" placeholder="e.g. 16" value={armHole} onChange={e => setArmHole(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Dress Length (in)</label>
                        <input type="number" placeholder="e.g. 40" value={dressLengthCustom} onChange={e => setDressLengthCustom(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Height (in)</label>
                        <input type="number" placeholder="e.g. 64" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5 sm:col-span-3">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Weight (lbs)</label>
                        <input type="number" placeholder="e.g. 130" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                    </div>
                  )}
                </div>

                {/* References */}
                <div className="space-y-2 pt-2 border-t border-gold/15">
                  <h5 className="text-[10px] font-bold uppercase text-gray-500">Design References & Uploads</h5>
                  <div className="grid grid-cols-1 gap-2.5">
                    <input
                      type="url"
                      placeholder="Pinterest Reference Link URL"
                      value={pinterestUrl}
                      onChange={e => setPinterestUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                    <input
                      type="url"
                      placeholder="Reference Image URL"
                      value={referenceImageUrl}
                      onChange={e => setReferenceImageUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                    <input
                      type="url"
                      placeholder="Sketch Image Link URL"
                      value={sketchUrl}
                      onChange={e => setSketchUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                    <input
                      type="url"
                      placeholder="Design Inspiration Reference URL"
                      value={inspirationUrl}
                      onChange={e => setInspirationUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 pt-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Special Instructions</label>
                  <textarea
                    rows="2.5"
                    placeholder="Specify styling details, pocket details, or fabric preferences..."
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold resize-none"
                  />
                </div>

                {/* Estimates */}
                <div className="pt-3 border-t border-gold/15 flex flex-col gap-1.5 text-xs text-gray-600 font-semibold bg-gold/5 p-3 rounded">
                  <div className="flex justify-between">
                    <span>Base Garment Price:</span>
                    <span className="font-sans text-gray-800 dark:text-white">${product.price}</span>
                  </div>
                  <div className="flex justify-between text-gold">
                    <span>Customization Surcharge:</span>
                    <span className="font-sans">+${getCustomSurcharge()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gold/20 pt-1.5 font-bold text-[var(--text-color)] text-sm">
                    <span>Live Estimated Price:</span>
                    <span className="font-sans text-gold">${product.price + getCustomSurcharge()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1 border-t border-dashed border-[var(--border-color)] pt-1.5">
                    <span>Lead Time:</span>
                    <span>5 Weeks</span>
                  </div>
                </div>

                {/* Handcrafted Warning Message */}
                <div className="flex gap-1.5 bg-gold/10 text-gold p-3 rounded text-[10px] items-start border border-gold/25 leading-relaxed font-semibold">
                  <FiInfo size={14} className="shrink-0 mt-0.5" />
                  <span>This customized garment is handcrafted and requires approximately five weeks for production. Custom pieces cannot be returned or refunded.</span>
                </div>

              </motion.div>
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
