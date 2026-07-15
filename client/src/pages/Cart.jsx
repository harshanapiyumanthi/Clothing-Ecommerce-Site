import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiSliders, FiX, FiCheck, FiInfo, FiEdit, FiHeart } from 'react-icons/fi';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Customization Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editedCustom, setEditedCustom] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const openEditCustomizer = (item) => {
    setEditingItem(item);
    setEditedCustom(JSON.parse(JSON.stringify(item.customization)));
  };

  const getEditedSurcharge = (customObj) => {
    if (!customObj) return 0;
    let extra = 0;
    const { fabric, sleeveDesign, buttons, sizeType } = customObj;
    
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

    if (sizeType === 'Custom') extra += 30;
    return extra;
  };

  const saveEditCustomizer = () => {
    if (!editingItem || !editedCustom) return;
    
    const basePrice = editingItem.basePrice || editingItem.price - 50; 
    const surcharge = getEditedSurcharge(editedCustom);
    const updatedPrice = basePrice + surcharge;
    
    const updatedItem = {
      ...editingItem,
      price: updatedPrice,
      size: editedCustom.sizeType === 'Custom' ? 'Custom' : editedCustom.standardSize,
      color: editedCustom.color,
      customization: editedCustom
    };

    dispatch(addToCart(updatedItem));
    toast.success('Garment customization updated!');
    setEditingItem(null);
    setEditedCustom(null);
  };

  const updateCustomField = (field, value) => {
    setEditedCustom(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMeasurementField = (field, value) => {
    setEditedCustom(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const updateQty = (item, qty) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const removeItem = (item) => {
    dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }));
  };

  const saveForLater = (item) => {
    dispatch(toggleWishlist(item));
    dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }));
    toast.success(`${item.name} saved for later!`);
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setDiscountAmount(subtotal * 0.10);
      toast.success('WELCOME10 coupon applied! 10% discount subtracted.');
    } else if (code === 'GOLD20') {
      setAppliedCoupon('GOLD20');
      setDiscountAmount(subtotal * 0.20);
      toast.success('GOLD20 coupon applied! 20% discount subtracted.');
    } else {
      toast.error('Invalid coupon code. Try GOLD20 or WELCOME10!');
    }
  };

  const handleProceedToCheckout = () => {
    // Save coupon specs to pass to checkout stage
    localStorage.setItem('checkout_coupon', JSON.stringify({
      code: appliedCoupon,
      discount: discountAmount
    }));
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold uppercase tracking-widest mb-10 text-center">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg opacity-60 mb-6">Your shopping shopping cart is currently empty.</p>
          <Link to="/shop" className="bg-primary text-secondary px-8 py-4 uppercase tracking-widest text-sm hover:bg-gold transition-colors duration-300">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items */}
          <div className="w-full lg:w-2/3">
            <div className="border-b border-border-color pb-4 mb-6 hidden md:grid grid-cols-12 gap-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-border-color pb-6">
                  <div className="col-span-1 md:col-span-6 flex gap-4">
                    <img src={item.image} alt={item.name} className="w-24 h-32 object-cover bg-gray-100" />
                    <div className="flex flex-col justify-center">
                      <Link to={`/product/${item.productId || item.id}`} className="font-semibold text-lg hover:text-gold transition-colors">{item.name}</Link>
                      <p className="text-sm opacity-60 mt-1">Size: {item.size} | Color: {item.color}</p>
                      
                      {item.isCustom && item.customization && (
                        <div className="mt-2 text-xs bg-gold/10 text-gold/90 p-3 rounded border border-gold/20 space-y-2 max-w-sm">
                          <p className="font-bold uppercase tracking-wider text-[9px] text-gold border-b border-gold/15 pb-1 flex items-center gap-1">
                            <FiSliders size={12} /> Bespoke Tailoring Details
                          </p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                            <p>Fabric: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.fabric}</span></p>
                            <p>Pattern: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.pattern || 'Solid'}</span></p>
                            <p>Neck: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.neckDesign}</span></p>
                            <p>Sleeve: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.sleeveDesign}</span></p>
                            <p>Length: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.dressLength}</span></p>
                            <p>Fit: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.fit}</span></p>
                            <p>Buttons: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.buttons || 'None'}</span></p>
                          </div>

                          {item.customization.sizeType === 'Custom' && item.customization.measurements ? (
                            <div className="pt-2 border-t border-gold/10 text-[9px] space-y-0.5">
                              <p className="font-bold uppercase text-[8px] tracking-widest opacity-80 mb-1">Tailored Measurements:</p>
                              <div className="grid grid-cols-3 gap-x-1 gap-y-0.5 opacity-85 font-mono">
                                <span>Bust: {item.customization.measurements.bust}"</span>
                                <span>Waist: {item.customization.measurements.waist}"</span>
                                <span>Hip: {item.customization.measurements.hip}"</span>
                                <span>Shldr: {item.customization.measurements.shoulder}"</span>
                                <span>Neck: {item.customization.measurements.neck}"</span>
                                <span>SlvLen: {item.customization.measurements.sleeveLength}"</span>
                                <span>ArmH: {item.customization.measurements.armHole}"</span>
                                <span>DressL: {item.customization.measurements.dressLength}"</span>
                                <span>Hght: {item.customization.measurements.height}"</span>
                                <span className="col-span-3">Wght: {item.customization.measurements.weight}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[9px] opacity-85 pt-1.5 border-t border-gold/10">Size: Standard {item.customization.standardSize}</p>
                          )}

                          {(item.customization.pinterestUrl || item.customization.referenceImageUrl || item.customization.sketchUrl || item.customization.inspirationUrl) && (
                            <div className="pt-1.5 border-t border-gold/10 text-[9px] space-y-0.5 opacity-85">
                              <p className="font-bold uppercase text-[8px] tracking-widest opacity-80 mb-0.5">Attached Inspirations:</p>
                              <div className="flex flex-wrap gap-2 text-gold">
                                {item.customization.pinterestUrl && <a href={item.customization.pinterestUrl} target="_blank" rel="noreferrer" className="underline hover:text-black">Pinterest</a>}
                                {item.customization.referenceImageUrl && <a href={item.customization.referenceImageUrl} target="_blank" rel="noreferrer" className="underline hover:text-black">Reference</a>}
                                {item.customization.sketchUrl && <a href={item.customization.sketchUrl} target="_blank" rel="noreferrer" className="underline hover:text-black">Sketch</a>}
                                {item.customization.inspirationUrl && <a href={item.customization.inspirationUrl} target="_blank" rel="noreferrer" className="underline hover:text-black">Inspiration</a>}
                              </div>
                            </div>
                          )}

                          {item.customization.specialInstructions && (
                            <p className="text-[9px] text-gray-500 italic pt-1.5 border-t border-gold/10">
                              Instruction: "{item.customization.specialInstructions}"
                            </p>
                          )}

                          <p className="text-[8px] italic opacity-75 mt-1 font-semibold flex items-center gap-1 text-gold/80 pt-1 border-t border-dashed border-gold/15">
                            <FiInfo size={10} /> Handcrafted: 5 Weeks production time.
                          </p>

                          <button 
                            onClick={() => openEditCustomizer(item)} 
                            className="text-[10px] text-gold hover:text-black flex items-center gap-1 mt-2 w-max transition-colors font-bold uppercase tracking-wider cursor-pointer border border-gold/20 px-2 py-0.5 rounded bg-white dark:bg-gray-900"
                          >
                            <FiEdit size={10} /> Edit Customization
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <button onClick={() => saveForLater(item)} className="text-[11px] font-bold uppercase tracking-wider text-gold hover:text-black flex items-center gap-1 transition-colors cursor-pointer">
                          <FiHeart size={12} /> Save for Later
                        </button>
                        <button onClick={() => removeItem(item)} className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer">
                          <FiTrash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 text-left md:text-center font-medium">
                    <span className="md:hidden opacity-60 text-sm">Price: </span>${item.price}
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                    <div className="flex items-center border border-border-color h-10 w-24">
                      <button onClick={() => updateQty(item, Math.max(1, item.qty - 1))} className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FiMinus size={14}/></button>
                      <span className="flex-grow text-center text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item, item.qty + 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FiPlus size={14}/></button>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 text-left md:text-right font-semibold text-gold">
                    <span className="md:hidden text-primary dark:text-white opacity-60 text-sm font-normal">Subtotal: </span>
                    ${item.price * item.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 dark:bg-gray-900 p-8">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-border-color pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="opacity-70">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="opacity-70">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-6 pb-6 border-b border-border-color space-y-2">
                <p className="text-xs opacity-70">Have a coupon code? (Try GOLD20 or WELCOME10)</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="flex-grow border border-border-color bg-transparent px-3 py-1.5 text-xs outline-none focus:border-gold rounded" 
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-gold hover:bg-black text-white px-4 py-1.5 text-xs uppercase tracking-wider transition-colors rounded cursor-pointer font-bold"
                  >
                    Apply
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
                <span className="text-xl font-bold text-gold font-sans">${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-gold text-white py-3.5 uppercase tracking-widest text-xs font-bold hover:bg-black transition-colors duration-300 rounded cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
          
        </div>
      )}

      {/* Edit Customization Modal */}
      {editingItem && editedCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button 
              onClick={() => { setEditingItem(null); setEditedCustom(null); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gold p-1.5 cursor-pointer z-10"
            >
              <FiX size={20} />
            </button>

            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold uppercase tracking-widest text-gold font-sans">Edit Bespoke Customization</h3>
                <p className="text-xs text-gray-400">Modify your dress measurements and design choices for this item.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1.5 animate-fade-in">
                {/* Fabric */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Fabric Option</label>
                  <select
                    value={editedCustom.fabric}
                    onChange={(e) => updateCustomField('fabric', e.target.value)}
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
                    value={editedCustom.pattern || 'Solid'}
                    onChange={(e) => updateCustomField('pattern', e.target.value)}
                    className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Solid">Solid (+$0)</option>
                    <option value="Floral">Floral (+$15)</option>
                    <option value="Stripes">Stripes (+$10)</option>
                    <option value="Polka Dots">Polka Dots (+$10)</option>
                    <option value="Plaid">Plaid (+$15)</option>
                  </select>
                </div>

                {/* Color option */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Color Selection</label>
                  <input
                    type="text"
                    value={editedCustom.color}
                    onChange={(e) => updateCustomField('color', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold"
                  />
                </div>

                {/* Neck design */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Neckline Design</label>
                  <select
                    value={editedCustom.neckDesign}
                    onChange={(e) => updateCustomField('neckDesign', e.target.value)}
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
                    value={editedCustom.sleeveDesign}
                    onChange={(e) => updateCustomField('sleeveDesign', e.target.value)}
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

                {/* Dress Length */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Dress Length</label>
                  <select
                    value={editedCustom.dressLength}
                    onChange={(e) => updateCustomField('dressLength', e.target.value)}
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
                  <label className="text-[10px] font-bold uppercase text-gray-500">Fit & Posture</label>
                  <select
                    value={editedCustom.fit}
                    onChange={(e) => updateCustomField('fit', e.target.value)}
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
                    value={editedCustom.buttons || 'None'}
                    onChange={(e) => updateCustomField('buttons', e.target.value)}
                    className="w-full px-2.5 py-2 bg-transparent border border-[var(--border-color)] text-xs rounded outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="None">None (+$0)</option>
                    <option value="Pearl Buttons">Pearl Buttons (+$15)</option>
                    <option value="Metallic Buttons">Metallic Buttons (+$10)</option>
                    <option value="Wooden Buttons">Wooden Buttons (+$5)</option>
                    <option value="Fabric Buttons">Fabric Buttons (+$10)</option>
                  </select>
                </div>

                {/* Sizing toggle */}
                <div className="space-y-3 pt-4 border-t border-gold/15 sm:col-span-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="text-xs font-bold uppercase text-gray-500">Sizing Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateCustomField('sizeType', 'Standard')}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${editedCustom.sizeType !== 'Custom' ? 'bg-gold text-white shadow' : 'border border-gold/40 text-gold hover:bg-gold/10'}`}
                      >
                        Standard Size
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateCustomField('sizeType', 'Custom');
                          if (!editedCustom.measurements) {
                            updateCustomField('measurements', { bust: '', waist: '', hip: '', shoulder: '', neck: '', sleeveLength: '', armHole: '', dressLength: '', height: '', weight: '' });
                          }
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${editedCustom.sizeType === 'Custom' ? 'bg-gold text-white shadow' : 'border border-gold/40 text-gold hover:bg-gold/10'}`}
                      >
                        Custom Measurements (+$30)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[10px] text-gold underline cursor-pointer hover:text-black font-bold uppercase tracking-wider ml-auto"
                    >
                      Size Guide
                    </button>
                  </div>

                  {editedCustom.sizeType !== 'Custom' ? (
                    <div className="flex items-center gap-2 pt-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Standard Size:</span>
                      <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => updateCustomField('standardSize', sz)}
                            className={`w-8 h-8 text-xs font-bold border transition-colors ${editedCustom.standardSize === sz ? 'bg-gold border-gold text-white' : 'border-[var(--border-color)] text-gray-600 hover:border-gold'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gold/5 p-4 rounded border border-gold/15 font-sans">
                      {['bust', 'waist', 'hip', 'shoulder', 'neck', 'sleeveLength', 'armHole', 'dressLength', 'height', 'weight'].map((field) => (
                        <div className="space-y-0.5" key={field}>
                          <label className="text-[9px] font-semibold text-gray-500 uppercase">{field} {field === 'weight' ? '(lbs)' : '(in)'}</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 34" 
                            value={editedCustom.measurements?.[field] || ''} 
                            onChange={e => updateMeasurementField(field, e.target.value)} 
                            className="w-full p-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs text-center" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* References */}
                <div className="space-y-2 pt-2 border-t border-gold/15 sm:col-span-2">
                  <h5 className="text-[10px] font-bold uppercase text-gray-500">Design References & Uploads</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="url"
                      placeholder="Pinterest Reference Link URL"
                      value={editedCustom.pinterestUrl || ''}
                      onChange={e => updateCustomField('pinterestUrl', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                    <input
                      type="url"
                      placeholder="Reference Image URL"
                      value={editedCustom.referenceImageUrl || ''}
                      onChange={e => updateCustomField('referenceImageUrl', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                    <input
                      type="url"
                      placeholder="Sketch Image Link URL"
                      value={editedCustom.sketchUrl || ''}
                      onChange={e => updateCustomField('sketchUrl', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                    <input
                      type="url"
                      placeholder="Design Inspiration Reference URL"
                      value={editedCustom.inspirationUrl || ''}
                      onChange={e => updateCustomField('inspirationUrl', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 pt-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Special Instructions</label>
                  <textarea
                    rows="2"
                    placeholder="Specify styling details, pocket details, or fabric preferences..."
                    value={editedCustom.specialInstructions || ''}
                    onChange={e => updateCustomField('specialInstructions', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>

              {/* Estimate Details */}
              <div className="pt-3 border-t border-gold/15 flex flex-col gap-1 text-xs text-gray-600 font-semibold bg-gold/5 p-3 rounded">
                <div className="flex justify-between">
                  <span>Base Garment Price:</span>
                  <span className="font-sans text-gray-800 dark:text-white">${editingItem.basePrice || editingItem.price - 50}</span>
                </div>
                <div className="flex justify-between text-gold">
                  <span>Customization Surcharge:</span>
                  <span className="font-sans">+${getEditedSurcharge(editedCustom)}</span>
                </div>
                <div className="flex justify-between border-t border-gold/20 pt-1.5 font-bold text-[var(--text-color)] text-sm">
                  <span>Live Estimated Price:</span>
                  <span className="font-sans text-gold">${(editingItem.basePrice || editingItem.price - 50) + getEditedSurcharge(editedCustom)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  onClick={() => { setEditingItem(null); setEditedCustom(null); }}
                  className="px-4 py-2 border border-[var(--border-color)] hover:border-gold hover:text-gold rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditCustomizer}
                  className="px-5 py-2.5 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors shadow-md shadow-gold/25 cursor-pointer"
                >
                  Save Customization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal (Sub-modal) */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-gray-555 hover:text-gold p-1.5 cursor-pointer z-10"
            >
              <FiX size={20} />
            </button>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center">GFLOCK Sizing Chart</h3>
              <div className="h-0.5 w-16 bg-gold mx-auto mb-4"></div>
              
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
                      <tr key={idx} className="hover:bg-gray-55 dark:hover:bg-gray-800/50">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
