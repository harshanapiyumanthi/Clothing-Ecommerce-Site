import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load coupon discount details
  const couponData = JSON.parse(localStorage.getItem('checkout_coupon') || '{"code":"","discount":0}');
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = couponData.discount || 0;
  const shippingFee = subtotal > 0 ? 15 : 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const placeOrder = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const address = formData.get('address');
    const city = formData.get('city');
    const postalCode = formData.get('postalCode');
    const phone = formData.get('phone');

    const orderId = 'ord-' + Date.now().toString().slice(-4);

    const newOrder = {
      id: orderId,
      user: {
        name: `${firstName} ${lastName}`,
        email: 'customer@gmail.com'
      },
      orderItems: cartItems.map(item => ({
        product: item.productId || item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: item.qty,
        size: item.size,
        color: item.color,
        isCustom: item.isCustom || false,
        customization: item.customization || null
      })),
      shippingAddress: {
        fullName: `${firstName} ${lastName}`,
        address,
        city,
        postalCode,
        country: 'Sri Lanka',
        phone
      },
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shippingFee,
      discount: discount,
      totalPrice: total,
      isPaid: paymentMethod === 'Stripe',
      paidAt: paymentMethod === 'Stripe' ? new Date().toISOString() : null,
      orderStatus: 'Order Received',
      createdAt: new Date().toISOString()
    };

    const currentOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    currentOrders.unshift(newOrder);
    localStorage.setItem('admin_orders', JSON.stringify(currentOrders));

    // Clear coupon selection
    localStorage.removeItem('checkout_coupon');

    dispatch(clearCart());
    navigate(`/order-success?orderId=${orderId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold uppercase tracking-widest mb-10 text-center">Checkout</h1>
      
      <form onSubmit={placeOrder} className="flex flex-col md:flex-row gap-12">
        
        {/* Delivery Details */}
        <div className="w-full md:w-2/3 space-y-8">
          
          <div>
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6 border-b border-border-color pb-2">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name" required className="border border-border-color bg-transparent px-4 py-3 outline-none focus:border-gold" />
              <input type="text" name="lastName" placeholder="Last Name" required className="border border-border-color bg-transparent px-4 py-3 outline-none focus:border-gold" />
              <input type="text" name="address" placeholder="Address Line 1" required className="col-span-1 md:col-span-2 border border-border-color bg-transparent px-4 py-3 outline-none focus:border-gold" />
              <input type="text" name="city" placeholder="City" required className="border border-border-color bg-transparent px-4 py-3 outline-none focus:border-gold" />
              <input type="text" name="postalCode" placeholder="Postal Code" required className="border border-border-color bg-transparent px-4 py-3 outline-none focus:border-gold" />
              <input type="tel" name="phone" placeholder="Phone Number" required className="col-span-1 md:col-span-2 border border-border-color bg-transparent px-4 py-3 outline-none focus:border-gold" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6 border-b border-border-color pb-2">Payment Method</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-border-color cursor-pointer hover:border-gold transition-colors">
                <input type="radio" name="payment" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5" />
                <span className="font-medium">Credit/Debit Card (Stripe)</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border-color cursor-pointer hover:border-gold transition-colors">
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5" />
                <span className="font-medium">Cash on Delivery</span>
              </label>
            </div>
          </div>
 
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-50 dark:bg-gray-900 p-6 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-border-color pb-4">Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-12 h-16 object-cover bg-gray-200" />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{item.qty}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs opacity-60 text-gold font-semibold">${item.price}</p>
                    {item.isCustom && item.customization && (
                      <p className="text-[10px] text-gold font-semibold mt-0.5">Bespoke Custom Spec</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[var(--border-color)] pt-4 mb-6 space-y-2 text-xs">
              <div className="flex justify-between opacity-80"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-gold font-semibold">
                  <span>Discount ({couponData.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between opacity-80"><span>Shipping</span><span>${shippingFee.toFixed(2)}</span></div>
            </div>
            
            <div className="flex justify-between items-center mb-8 font-bold text-base border-t border-[var(--border-color)] pt-4">
              <span className="uppercase tracking-wider">Total</span>
              <span className="text-gold font-sans text-lg">${total.toFixed(2)}</span>
            </div>
            
            <button type="submit" className="w-full bg-gold text-white py-4 uppercase tracking-widest font-bold hover:bg-black transition-colors duration-300">
              Place Order
            </button>
          </div>
        </div>
        
      </form>
    </div>
  );
};

export default Checkout;
