import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import Input from '../components/common/Input';
import { FiCheck, FiChevronRight, FiLock, FiTruck, FiMapPin, FiCreditCard, FiAlertTriangle, FiRefreshCw, FiShoppingBag, FiShield } from 'react-icons/fi';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, failed
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth || { userInfo: JSON.parse(localStorage.getItem('userInfo')) });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0 && paymentStatus !== 'failed') {
      toast.info('Your cart is empty. Redirecting to shop.');
      navigate('/shop');
    }
  }, [cartItems, navigate, paymentStatus]);

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm({
    defaultValues: {
      firstName: userInfo?.name?.split(' ')[0] || '',
      lastName: userInfo?.name?.split(' ')[1] || '',
      address: '',
      city: '',
      postalCode: '',
      phone: ''
    },
    mode: 'onChange'
  });

  const couponData = JSON.parse(localStorage.getItem('checkout_coupon') || '{"code":"","discount":0}');
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = couponData.discount || 0;
  
  let shippingFee = subtotal > 0 ? 15 : 0;
  if (shippingMethod === 'Express') shippingFee = 35;
  if (shippingMethod === 'Pickup') shippingFee = 0;

  const total = Math.max(0, subtotal - discount + shippingFee);

  const steps = [
    { id: 1, name: 'Address', icon: <FiMapPin /> },
    { id: 2, name: 'Shipping', icon: <FiTruck /> },
    { id: 3, name: 'Payment', icon: <FiCreditCard /> },
    { id: 4, name: 'Review', icon: <FiCheck /> }
  ];

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger();
      if (!isValid) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const processPayment = async () => {
    const data = getValues();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('processing');

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
        shippingMethod,
        couponCode: couponData.code || null,
        shippingFee
      };

      // 1. Create order
      const res = await axios.post('http://localhost:5000/api/orders', orderData, config);

      if (res.data.success) {
        
        // 2. COD handles immediately
        if (paymentMethod === 'COD') {
          localStorage.removeItem('checkout_coupon');
          dispatch(clearCart());
          navigate(`/order-success?orderId=${res.data.order._id}`);
          return;
        }

        // 3. Process payment intent (Strategy Factory routing on server)
        try {
          const intentRes = await axios.post('http://localhost:5000/api/payments/intent', {
              amount: total,
              orderId: res.data.order._id,
              paymentMethod
          }, config);
          
          // Simulated 3D Secure / Payment Gateway Verification Delay
          await new Promise(resolve => setTimeout(resolve, 2500));
          
          const transactionId = intentRes.data.transactionId || intentRes.data.id || `mock_trx_${Date.now()}`;

          // Verify transaction status
          const verifyRes = await axios.get(`http://localhost:5000/api/payments/verify/${transactionId}?method=${paymentMethod}`, config);
          
          if (verifyRes.data.success || verifyRes.data.status === 'succeeded') {
              localStorage.removeItem('checkout_coupon');
              dispatch(clearCart());
              navigate(`/order-success?orderId=${res.data.order._id}`);
          } else {
              setPaymentStatus('failed');
              setIsSubmitting(false);
          }
        } catch (paymentError) {
          console.error("Payment routing failed:", paymentError);
          setPaymentStatus('failed');
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      if (paymentMethod !== 'COD') {
        setPaymentStatus('failed');
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
      setIsSubmitting(false);
    }
  };

  // Payment Failure Recovery Screen
  if (paymentStatus === 'failed') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-200 dark:border-red-900">
          <FiAlertTriangle className="text-red-500 text-4xl" />
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-wider mb-4">Payment Declined</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          We couldn't process your payment. This could be due to insufficient funds, an expired card, or network issues. Don't worry, your cart is securely saved.
        </p>
        
        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-4 mx-auto max-w-md shadow-sm">
          <button 
            onClick={() => { setPaymentStatus('idle'); setIsSubmitting(false); setCurrentStep(3); }}
            className="w-full flex items-center justify-center gap-2 bg-gold text-white px-6 py-3.5 rounded font-bold uppercase tracking-widest hover:bg-black transition-colors"
          >
            <FiRefreshCw /> Retry Payment
          </button>
          
          <button 
            onClick={() => { setPaymentStatus('idle'); setPaymentMethod('COD'); setIsSubmitting(false); setCurrentStep(4); }}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 px-6 py-3.5 rounded font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors"
          >
            <FiTruck /> Switch to Cash on Delivery
          </button>
          
          <button 
            onClick={() => navigate('/shop')}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-[var(--text-color)] px-6 py-2 uppercase font-bold text-xs tracking-wider transition-colors mt-2"
          >
            <FiShoppingBag /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)] flex items-center justify-center gap-3">
          <FiLock size={24} className="text-gold" /> Secure Checkout
        </h1>
        <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">256-Bit Encrypted Secure Transaction</p>
      </div>
      
      {/* Step Indicator */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200 dark:bg-gray-800 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gold -z-10 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
                  currentStep === step.id 
                    ? 'bg-gold border-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                    : currentStep > step.id 
                      ? 'bg-black border-black text-gold dark:bg-white dark:border-white' 
                      : 'bg-white border-gray-200 text-gray-400 dark:bg-gray-900 dark:border-gray-800'
                }`}
              >
                {currentStep > step.id ? <FiCheck size={18} /> : step.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.id ? 'text-gold' : 'text-gray-400'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-[#111] p-8 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm min-h-[400px]">
            
            <form id="checkout-form" onSubmit={(e) => e.preventDefault()}>
              
              {/* STEP 1: Address */}
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-[var(--text-color)]">1. Delivery Address</h2>
                  </div>
                  
                  <div className="bg-gold/5 border border-gold/20 p-4 rounded-lg mb-6 flex items-start gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <FiMapPin className="text-gold shrink-0 mt-0.5" size={16} />
                    <p>Enter your primary shipping destination. To save multiple addresses or use your address book, please visit your account dashboard.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input placeholder="First Name" {...register('firstName', { required: 'First name is required' })} error={errors.firstName} />
                    <Input placeholder="Last Name" {...register('lastName', { required: 'Last name is required' })} error={errors.lastName} />
                    <Input placeholder="Address Line 1" className="col-span-1 md:col-span-2" {...register('address', { required: 'Address is required' })} error={errors.address} />
                    <Input placeholder="City" {...register('city', { required: 'City is required' })} error={errors.city} />
                    <Input placeholder="Postal Code" {...register('postalCode', { required: 'Postal code is required' })} error={errors.postalCode} />
                    <Input placeholder="Phone Number" type="tel" className="col-span-1 md:col-span-2" {...register('phone', { required: 'Phone number is required' })} error={errors.phone} />
                  </div>
                </div>
              )}

              {/* STEP 2: Shipping */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-[var(--text-color)]">2. Shipping Method</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-300 ${shippingMethod === 'Standard' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <input type="radio" name="shipping" value="Standard" checked={shippingMethod === 'Standard'} onChange={(e) => setShippingMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm tracking-wider uppercase">Standard Delivery</span>
                          <span className="font-sans font-semibold text-gold">$15.00</span>
                        </div>
                        <p className="text-xs text-gray-500">Delivered within 3-5 business days.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-300 ${shippingMethod === 'Express' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <input type="radio" name="shipping" value="Express" checked={shippingMethod === 'Express'} onChange={(e) => setShippingMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm tracking-wider uppercase">Express Premium</span>
                          <span className="font-sans font-semibold text-gold">$35.00</span>
                        </div>
                        <p className="text-xs text-gray-500">Delivered within 1-2 business days with priority handling.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-300 ${shippingMethod === 'Pickup' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <input type="radio" name="shipping" value="Pickup" checked={shippingMethod === 'Pickup'} onChange={(e) => setShippingMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm tracking-wider uppercase">Boutique Pickup</span>
                          <span className="font-sans font-semibold text-green-600">Free</span>
                        </div>
                        <p className="text-xs text-gray-500">Pick up from our Colombo 07 flagship studio.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment */}
              {currentStep === 3 && (
                <div className="animate-fade-in space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-[var(--text-color)]">3. Secure Payment</h2>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-bold uppercase tracking-wider">
                      <FiShield /> Encrypted
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Stripe Card Payment */}
                    <div className={`border rounded-xl transition-all duration-300 ${paymentMethod === 'Stripe' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <label className="flex items-start gap-4 p-5 cursor-pointer">
                        <input type="radio" name="payment" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                        <div>
                          <span className="block font-bold text-sm tracking-wider uppercase mb-1">Credit / Debit Card</span>
                          <p className="text-xs text-gray-500">Secure encrypted payment via Stripe.</p>
                        </div>
                      </label>
                      {/* Secure Card Visual Form (UI Only for realistic mockup) */}
                      {paymentMethod === 'Stripe' && (
                        <div className="px-5 pb-5 pt-2 border-t border-gold/20 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiCreditCard size={18} /></span>
                              <input type="text" placeholder="Card Number (0000 0000 0000 0000)" className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold transition-colors" />
                            </div>
                            <div>
                              <input type="text" placeholder="MM/YY" className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-gold transition-colors" />
                            </div>
                            <div>
                              <input type="text" placeholder="CVC" className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-gold transition-colors" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'Mintpay' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <input type="radio" name="payment" value="Mintpay" checked={paymentMethod === 'Mintpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                      <div>
                        <span className="block font-bold text-sm tracking-wider uppercase mb-1">Mintpay BNPL</span>
                        <p className="text-xs text-gray-500">Buy Now, Pay Later in 3 interest-free installments.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'FLEX' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <input type="radio" name="payment" value="FLEX" checked={paymentMethod === 'FLEX'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                      <div>
                        <span className="block font-bold text-sm tracking-wider uppercase mb-1">FLEX Installments</span>
                        <p className="text-xs text-gray-500">Flexible monthly payment plans tailored for luxury items.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'COD' ? 'border-gold bg-gold/5 shadow-md shadow-gold/10' : 'border-gray-200 dark:border-gray-800 hover:border-gold/50'}`}>
                      <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gold w-5 h-5 mt-0.5" />
                      <div>
                        <span className="block font-bold text-sm tracking-wider uppercase mb-1">Cash on Delivery</span>
                        <p className="text-xs text-gray-500">Pay physically when the items arrive at your doorstep.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: Review */}
              {currentStep === 4 && (
                <div className="animate-fade-in space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-[var(--text-color)]">4. Review & Place Order</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] p-5 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-gold">Delivery details</h3>
                        <button type="button" onClick={() => setCurrentStep(1)} className="text-[10px] text-gray-500 hover:text-gold uppercase font-bold tracking-wider underline">Edit</button>
                      </div>
                      <p className="text-xs font-semibold">{getValues('firstName')} {getValues('lastName')}</p>
                      <p className="text-xs text-gray-500">{getValues('address')}</p>
                      <p className="text-xs text-gray-500">{getValues('city')}, {getValues('postalCode')}</p>
                      <p className="text-xs text-gray-500">{getValues('phone')}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-[#0a0a0a] p-5 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-xs uppercase tracking-widest text-gold">Shipping Method</h3>
                          <button type="button" onClick={() => setCurrentStep(2)} className="text-[10px] text-gray-500 hover:text-gold uppercase font-bold tracking-wider underline">Edit</button>
                        </div>
                        <p className="text-xs font-semibold">{shippingMethod} Delivery</p>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#0a0a0a] p-5 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-xs uppercase tracking-widest text-gold">Payment Method</h3>
                          <button type="button" onClick={() => setCurrentStep(3)} className="text-[10px] text-gray-500 hover:text-gold uppercase font-bold tracking-wider underline">Edit</button>
                        </div>
                        <p className="text-xs font-semibold">{paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gold/10 border border-gold/30 p-5 rounded-lg text-center mt-6">
                    <p className="text-sm font-semibold mb-1 text-gold uppercase tracking-wider">Ready to complete your look?</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">By placing this order, you agree to our Terms & Conditions and Bespoke Return Policy.</p>
                  </div>
                </div>
              )}

            </form>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
              {currentStep > 1 && !isSubmitting ? (
                <button 
                  type="button" 
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors"
                >
                  Back
                </button>
              ) : <div></div>}
              
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold dark:hover:bg-gold hover:text-white transition-colors"
                >
                  Next Step <FiChevronRight />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={processPayment}
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-gold text-white rounded shadow-lg shadow-gold/30 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all disabled:opacity-80 disabled:cursor-wait relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <>
                      <FiRefreshCw className="animate-spin" /> Verifying Transaction...
                    </>
                  ) : (
                    <>
                      <FiLock /> Pay ${total.toFixed(2)}
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 sticky top-24 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="relative shrink-0">
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-gray-100 rounded-md border border-gray-200 dark:border-gray-800" />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{item.qty}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size} | {item.color}</p>
                    <p className="text-sm font-bold text-gold font-sans mt-1">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-6 space-y-3 text-xs font-medium">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span className="font-sans text-[var(--text-color)] font-semibold">${subtotal.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-gold font-semibold">
                  <span>Discount ({couponData.code})</span>
                  <span className="font-sans">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-sans text-[var(--text-color)] font-semibold">{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2 font-bold text-base border-t border-gray-200 dark:border-gray-800 pt-4">
              <span className="uppercase tracking-wider">Grand Total</span>
              <span className="text-gold font-sans text-2xl">${total.toFixed(2)}</span>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Checkout;
