import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMinus, FiPlus, FiStar, FiSliders, FiInfo, FiCheck, FiX, FiShoppingBag } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

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
  const [neckDesign, setNeckDesign] = useState('Boat Neck');
  const [sleeveDesign, setSleeveDesign] = useState('Short Sleeves');
  const [dressLength, setDressLength] = useState('Midi');
  const [fit, setFit] = useState('Regular Fit');
  const [useCustomMeasurements, setUseCustomMeasurements] = useState(false);
  
  // Custom measurements
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [sleeve, setSleeve] = useState('');
  const [length, setLength] = useState('');
  
  // Upload references (URLs for simplicity in mock backend uploads)
  const [inspirationUrl, setInspirationUrl] = useState('');
  const [sketchUrl, setSketchUrl] = useState('');
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Complete The Look popup state
  const [showLookModal, setShowLookModal] = useState(false);
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  useEffect(() => {
    // Fetch products
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    // Try matching param ID
    let found = products.find(p => p.id === id);
    if (!found) {
      // Fallback to prod-1 or mock product details
      found = products[0] || {
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
    setLoading(false);
  }, [id]);

  // Load accessory recommendations when modal opens
  const loadRecommendations = () => {
    const recs = JSON.parse(localStorage.getItem('admin_recommendations') || '[]');
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    
    // Find recommendations assigned to this product
    const prodRec = recs.find(r => r.productId === product.id);
    let matchedAccs = [];
    if (prodRec && prodRec.assignedProducts?.length > 0) {
      matchedAccs = products.filter(p => prodRec.assignedProducts.includes(p.id));
    } else {
      // Fallback: load any accessories in the category
      matchedAccs = products.filter(p => p.category === 'Accessories').slice(0, 3);
    }
    setAccessories(matchedAccs);
  };

  const handleAddMainToCart = () => {
    // If user selected custom measurements, validate them
    if (showCustomizer && useCustomMeasurements) {
      if (!bust || !waist || !hip || !shoulder || !sleeve || !length) {
        toast.warning('Please fill in all custom measurements.');
        return;
      }
    }

    // Trigger Recommendation Popup
    loadRecommendations();
    setShowLookModal(true);
  };

  const finalizeCartAdd = (includeAccessories = []) => {
    const isCustom = showCustomizer;
    const finalPrice = isCustom ? product.price + 50 : product.price; // $50 customization surcharge
    const itemId = isCustom ? `${product.id}-custom-${Date.now()}` : product.id;

    const customizationData = isCustom ? {
      fabric,
      color: customColor || selectedColor,
      neckDesign,
      sleeveDesign,
      dressLength,
      fit,
      sizeType: useCustomMeasurements ? 'Custom' : 'Standard',
      standardSize: useCustomMeasurements ? null : selectedSize,
      measurements: useCustomMeasurements ? { bust, waist, hip, shoulder, sleeve, length } : null,
      inspirationUrl,
      sketchUrl,
      pinterestUrl,
      specialInstructions,
      productionTime: '5 weeks'
    } : null;

    // Dispatch primary item
    dispatch(addToCart({
      id: itemId,
      productId: product.id,
      name: product.name + (isCustom ? ' (Bespoke Custom)' : ''),
      price: finalPrice,
      image: product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80',
      qty,
      size: isCustom && useCustomMeasurements ? 'Custom' : selectedSize,
      color: selectedColor,
      isCustom,
      customization: customizationData
    }));

    // Dispatch accessory items
    includeAccessories.forEach(acc => {
      dispatch(addToCart({
        id: acc.id,
        productId: acc.id,
        name: acc.name,
        price: acc.discountPrice || acc.price,
        image: acc.images?.[0]?.url || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80',
        qty: 1,
        size: acc.sizes?.[0] || 'One Size',
        color: acc.colors?.[0] || 'Neutral',
        isCustom: false
      }));
    });

    toast.success('Shopping Cart updated!');
    setShowLookModal(false);
  };

  const handleAccessoryToggle = (accId) => {
    if (selectedAccessories.includes(accId)) {
      setSelectedAccessories(selectedAccessories.filter(id => id !== accId));
    } else {
      setSelectedAccessories([...selectedAccessories, accId]);
    }
  };

  const handleSkipLook = () => {
    finalizeCartAdd([]);
  };

  const handleAddLook = () => {
    const itemsToAdd = accessories.filter(a => selectedAccessories.includes(a.id));
    finalizeCartAdd(itemsToAdd);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  // Surcharge calculation
  const currentPrice = showCustomizer ? product.price + 50 : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Product Images */}
        <div className="w-full lg:w-1/2 flex gap-4">
          <div className="flex flex-col gap-4 w-24">
            {product.images?.map((img, i) => (
              <div key={i} className="h-32 bg-gray-150 cursor-pointer border border-[var(--border-color)] hover:border-gold transition-colors">
                <img src={img.url || img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex-grow bg-gray-150 h-[500px] sm:h-[600px] overflow-hidden group border border-[var(--border-color)]">
            <img src={product.images?.[0]?.url || product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115" />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
          
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-[var(--text-color)]">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => <FiStar key={i} fill={i < 4 ? 'currentColor' : 'none'} size={15} />)}
              </div>
              <span className="text-xs opacity-65">(124 Reviews)</span>
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
              className="flex-grow h-12 bg-gold hover:bg-black text-white uppercase tracking-wider font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-gold/25 cursor-pointer"
            >
              <FiShoppingBag /> Add to Cart
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
                    <label className="text-[10px] font-bold uppercase text-gray-505">Fabric Option</label>
                    <select
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Georgette Silk">Georgette Silk</option>
                      <option value="Heavy Duty Linen">Heavy Duty Linen</option>
                      <option value="Premium Cotton">Premium Cotton</option>
                      <option value="Silk Velvet">Silk Velvet</option>
                      <option value="Merino Wool">Merino Wool</option>
                    </select>
                  </div>

                  {/* Custom color input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-505">Custom Color Spec</label>
                    <input
                      type="text"
                      placeholder="e.g. Lavender Blush, Emerald Green"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold"
                    />
                  </div>

                  {/* Neck design */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-505">Neckline Design</label>
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
                    </select>
                  </div>

                  {/* Sleeve design */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-505">Sleeve Option</label>
                    <select
                      value={sleeveDesign}
                      onChange={(e) => setSleeveDesign(e.target.value)}
                      className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Short Sleeves">Short Sleeves</option>
                      <option value="Sleeveless">Sleeveless</option>
                      <option value="Puff Sleeves">Puff Sleeves</option>
                      <option value="Three-Quarter">Three-Quarter</option>
                      <option value="Long Sleeves">Long Sleeves</option>
                    </select>
                  </div>

                  {/* Length */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-505">Dress Length</label>
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
                    <label className="text-[10px] font-bold uppercase text-gray-505">Posture & Fit</label>
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
                </div>

                {/* Sizing selection */}
                <div className="space-y-3 pt-2 border-t border-gold/15">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold uppercase text-gray-505">Sizing Sizing Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUseCustomMeasurements(false)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${!useCustomMeasurements ? 'bg-gold text-white' : 'border border-gold/40 text-gold'}`}
                      >
                        Standard Size
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseCustomMeasurements(true)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${useCustomMeasurements ? 'bg-gold text-white' : 'border border-gold/40 text-gold'}`}
                      >
                        Custom Measurements
                      </button>
                    </div>
                  </div>

                  {!useCustomMeasurements ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Standard Size:</span>
                      <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL'].map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`w-8 h-8 rounded text-xs font-semibold border ${selectedSize === sz ? 'bg-gold border-gold text-white' : 'border-[var(--border-color)] text-gray-600'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Bust (in)</label>
                        <input type="number" required placeholder="e.g. 34" value={bust} onChange={e => setBust(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Waist (in)</label>
                        <input type="number" required placeholder="e.g. 28" value={waist} onChange={e => setWaist(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Hip (in)</label>
                        <input type="number" required placeholder="e.g. 36" value={hip} onChange={e => setHip(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Shoulder (in)</label>
                        <input type="number" required placeholder="e.g. 15" value={shoulder} onChange={e => setShoulder(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Sleeve (in)</label>
                        <input type="number" required placeholder="e.g. 22" value={sleeve} onChange={e => setSleeve(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-semibold text-gray-500 uppercase">Length (in)</label>
                        <input type="number" required placeholder="e.g. 40" value={length} onChange={e => setLength(e.target.value)} className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center font-sans" />
                      </div>
                    </div>
                  )}
                </div>

                {/* References */}
                <div className="space-y-2 pt-2 border-t border-gold/15">
                  <h5 className="text-[10px] font-bold uppercase text-gray-505">Design Inspiration References</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="url"
                      placeholder="Pinterest Reference Link URL"
                      value={pinterestUrl}
                      onChange={e => setPinterestUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Sketch Image Link URL"
                      value={sketchUrl}
                      onChange={e => setSketchUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Inspiration Reference Link URL"
                      value={inspirationUrl}
                      onChange={e => setInspirationUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-505">Special Instructions</label>
                  <textarea
                    rows="2"
                    placeholder="Specify pocket requirements, lining colors, lace additions, or matching patterns..."
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold resize-none"
                  />
                </div>

                {/* Estimates */}
                <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500">Custom Surcharge: <span className="text-gold font-sans">+$50</span></span>
                  <span className="font-semibold text-gray-500">Lead Time: <span className="text-gray-900 dark:text-gray-150 font-sans">5 weeks</span></span>
                </div>

                {/* Tailoring notice */}
                <div className="flex gap-1.5 bg-gold/10 text-gold p-2.5 rounded text-[10px] items-start border border-gold/25 leading-relaxed font-semibold">
                  <FiInfo size={14} className="shrink-0 mt-0.5" />
                  <span>Custom tailoring takes approximately 5 weeks. No return or exchange options are supported for custom garments.</span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Complete Your Look popup Modal */}
      <AnimatePresence>
        {showLookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl w-full max-w-xl p-6 shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={handleSkipLook}
                className="absolute top-4 right-4 text-gray-500 hover:text-gold p-1 cursor-pointer"
              >
                <FiX size={18} />
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold uppercase tracking-widest text-gold font-sans">Complete Your Look</h3>
                <p className="text-xs text-gray-400">Pair this gorgeous item with matching luxury accessories hand-picked by our atelier styling team.</p>
              </div>

              {/* Recommendations list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {accessories.length === 0 ? (
                  <p className="text-center text-xs text-gray-500 py-6">No matching accessories available at this time.</p>
                ) : (
                  accessories.map(acc => (
                    <div 
                      key={acc.id} 
                      onClick={() => handleAccessoryToggle(acc.id)}
                      className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 select-none ${selectedAccessories.includes(acc.id) ? 'border-gold bg-gold/5 shadow-sm' : 'border-[var(--border-color)] hover:border-gray-400'}`}
                    >
                      <div className="flex items-center gap-3.5 text-xs">
                        <img 
                          src={acc.images?.[0]?.url || acc.images?.[0] || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80'} 
                          alt={acc.name} 
                          className="h-14 w-11 object-cover rounded bg-gray-150 border border-[var(--border-color)]" 
                        />
                        <div>
                          <h4 className="font-bold truncate max-w-[200px] text-gray-800 dark:text-gray-150">{acc.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{acc.brand || 'Atelier Collection'}</p>
                          <p className="text-xs font-bold text-gold font-sans mt-1.5">${acc.discountPrice || acc.price}</p>
                        </div>
                      </div>

                      {/* Checkbox indicator */}
                      <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${selectedAccessories.includes(acc.id) ? 'bg-gold border-gold text-white' : 'border-gray-300'}`}>
                        {selectedAccessories.includes(acc.id) && <FiCheck size={14} />}
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  onClick={handleSkipLook}
                  className="px-4 py-2 border border-[var(--border-color)] hover:border-gold hover:text-gold rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Skip
                </button>
                <button
                  onClick={handleAddLook}
                  disabled={selectedAccessories.length === 0}
                  className="px-5 py-2.5 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gold/25 cursor-pointer"
                >
                  Add Selected & Continue
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetails;
