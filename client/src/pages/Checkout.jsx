import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth || { userInfo: JSON.parse(localStorage.getItem('userInfo')) });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: userInfo?.name?.split(' ')[0] || '',
      lastName: userInfo?.name?.split(' ')[1] || '',
      address: '',
      city: '',
      postalCode: '',
      phone: ''
    }
  });

  const couponData = JSON.parse(localStorage.getItem('checkout_coupon') || '{"code":"","discount":0}');
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = couponData.discount || 0;
  const shippingFee = subtotal > 0 ? 15 : 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const onSubmit = async (data) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };

      const orderData = {
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
          fullName: `${data.firstName} ${data.lastName}`,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: 'Sri Lanka',
          phone: data.phone
        },
        paymentMethod,
        couponCode: couponData.code || null
      };

      const res = await axios.post('http://localhost:5000/api/orders', orderData, config);

      if (res.data.success) {
        localStorage.removeItem('checkout_coupon');
        dispatch(clearCart());
        navigate(`/order-success?orderId=${res.data.order._id}`);
      }
    } catch (error) {
      if (paymentMethod !== 'COD') {
        toast.error("We couldn't complete your payment right now. Your cart has been saved. Please try again or use another payment method.", { autoClose: 6000 });
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold uppercase tracking-widest mb-10 text-center">Checkout</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-12">
        
        {/* Delivery Details */}
        <div className="w-full md:w-2/3 space-y-8">
          <div>
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6 border-b border-border-color pb-2">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="First Name" 
                {...register('firstName', { required: 'First name is required' })} 
                error={errors.firstName}
              />
              <Input 
                placeholder="Last Name" 
                {...register('lastName', { required: 'Last name is required' })} 
                error={errors.lastName}
              />
              <Input 
                placeholder="Address Line 1" 
                className="col-span-1 md:col-span-2"
                {...register('address', { required: 'Address is required' })} 
                error={errors.address}
              />
              <Input 
                placeholder="City" 
                {...register('city', { required: 'City is required' })} 
                error={errors.city}
              />
              <Input 
                placeholder="Postal Code" 
                {...register('postalCode', { required: 'Postal code is required' })} 
                error={errors.postalCode}
              />
              <Input 
                placeholder="Phone Number" 
                type="tel"
                className="col-span-1 md:col-span-2"
                {...register('phone', { required: 'Phone number is required' })} 
                error={errors.phone}
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6 border-b border-border-color pb-2">Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'Stripe' ? 'border-gold bg-gold/5' : 'border-border-color hover:border-gold'}`}>
                <input type="radio" name="payment" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5" />
                <span className="font-medium">Credit/Debit Card (Stripe)</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'Mintpay' ? 'border-gold bg-gold/5' : 'border-border-color hover:border-gold'}`}>
                <input type="radio" name="payment" value="Mintpay" checked={paymentMethod === 'Mintpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5" />
                <span className="font-medium">Mintpay (Buy Now, Pay Later)</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'FLEX' ? 'border-gold bg-gold/5' : 'border-border-color hover:border-gold'}`}>
                <input type="radio" name="payment" value="FLEX" checked={paymentMethod === 'FLEX'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5" />
                <span className="font-medium">FLEX Installments</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-gold bg-gold/5' : 'border-border-color hover:border-gold'}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5" />
                <span className="font-medium">Cash on Delivery</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-50 dark:bg-[#111] p-6 sticky top-24 border border-border-color rounded-sm">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-border-color pb-4">Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="relative shrink-0">
                    <img src={item.image} alt={item.name} className="w-14 h-16 object-cover bg-gray-200 rounded-sm" />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{item.qty}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs opacity-60 text-gold font-semibold">${item.price}</p>
                    {item.isCustom && item.customization && (
                      <div className="text-[9px] text-gold/90 space-y-0.5 bg-gold/5 p-1.5 rounded border border-gold/15 mt-1">
                        <p className="font-bold uppercase tracking-wider text-[8px] text-gold">Bespoke Spec:</p>
                        <p className="truncate">Fabric: {item.customization.fabric}</p>
                        <p className="truncate">Sleeve: {item.customization.sleeveDesign}</p>
                      </div>
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
              <span className="text-gold font-sans text-xl">${total.toFixed(2)}</span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isSubmitting}
            >
              Place Order
            </Button>
          </div>
        </div>
        
      </form>
    </div>
  );
};

export default Checkout;
