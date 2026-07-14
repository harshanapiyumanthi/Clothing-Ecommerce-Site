import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiSliders } from 'react-icons/fi';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const updateQty = (item, qty) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const removeItem = (item) => {
    dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }));
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
                        <div className="mt-2 text-xs bg-gold/10 text-gold/90 p-2.5 rounded border border-gold/20 space-y-1 max-w-sm">
                          <p className="font-bold uppercase tracking-wider text-[9px] text-gold border-b border-gold/15 pb-1 flex items-center gap-1">
                            <FiSliders size={12} /> Custom Specs
                          </p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                            <p>Fabric: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.fabric}</span></p>
                            <p>Sleeve: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.sleeveDesign}</span></p>
                            <p>Neck: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.neckDesign}</span></p>
                            <p>Length: <span className="font-semibold text-gray-800 dark:text-gray-150">{item.customization.dressLength}</span></p>
                          </div>
                          {item.customization.sizeType === 'Custom' && item.customization.measurements ? (
                            <div className="pt-1 mt-1 border-t border-gold/10 text-[9px] grid grid-cols-3 gap-0.5 opacity-85">
                              <span>Bust: {item.customization.measurements.bust}"</span>
                              <span>Waist: {item.customization.measurements.waist}"</span>
                              <span>Hip: {item.customization.measurements.hip}"</span>
                              <span>Shldr: {item.customization.measurements.shoulder}"</span>
                              <span>Slv: {item.customization.measurements.sleeve}"</span>
                              <span>Len: {item.customization.measurements.length}"</span>
                            </div>
                          ) : (
                            <p className="text-[9px] opacity-85">Size: Standard {item.customization.standardSize}</p>
                          )}
                          <p className="text-[8px] italic opacity-75 mt-1 font-semibold">Custom production takes ~5 weeks.</p>
                        </div>
                      )}

                      <button onClick={() => removeItem(item)} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mt-3 w-max transition-colors">
                        <FiTrash2 /> Remove
                      </button>
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
    </div>
  );
};

export default Cart;
