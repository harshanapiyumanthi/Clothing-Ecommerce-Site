import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiSearch, FiSliders, FiCalendar, FiMapPin, FiCreditCard } from 'react-icons/fi';

const TRACKING_STAGES = [
  'Order Received',
  'Design Review',
  'Fabric Preparation',
  'Tailoring',
  'Quality Check',
  'Ready For Delivery',
  'Delivered'
];

const OrderSuccess = () => {
  const location = useLocation();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);

  // Extract orderId from URL query param
  const query = new URLSearchParams(location.search);
  const urlOrderId = query.get('orderId');

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    setOrdersList(orders);

    const activeId = urlOrderId || (orders.length > 0 ? orders[0].id : null);
    if (activeId) {
      const found = orders.find(o => o.id === activeId);
      setOrder(found || null);
    }
  }, [urlOrderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    const found = ordersList.find(o => o.id.toLowerCase() === orderIdInput.trim().toLowerCase());
    setOrder(found || null);
  };

  // Get active step index
  const getActiveStepIndex = () => {
    if (!order) return 0;
    const status = order.orderStatus || 'Pending';
    // Fallbacks for standard order status
    if (status === 'Pending' || status === 'Confirmed') return 0;
    if (status === 'Processing') return 2;
    if (status === 'Shipping') return 5;
    if (status === 'Delivered') return 6;
    if (status === 'Cancelled') return -1;
    
    const idx = TRACKING_STAGES.findIndex(s => s.toLowerCase() === status.toLowerCase());
    return idx !== -1 ? idx : 0;
  };

  const activeIndex = getActiveStepIndex();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-10">
      
      {/* Success Jumbotron (only if redirected from checkout) */}
      {urlOrderId && order && (
        <div className="text-center py-8 space-y-4">
          <div className="flex justify-center text-emerald-500">
            <FiCheckCircle size={64} className="animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)]">Order Confirmed</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Thank you for shopping with us! Your luxury tailoring/purchase order has been successfully placed.
          </p>
        </div>
      )}

      {/* Tracker Search Lookup */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl space-y-3 shadow-sm max-w-2xl mx-auto">
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Track Custom / Regular Orders</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FiSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Enter your Order ID (e.g. ord-1001, ord-1002)"
              value={orderIdInput}
              onChange={e => setOrderIdInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg text-xs outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Track Status
          </button>
        </form>
      </div>

      {order ? (
        <div className="space-y-8">
          
          {/* Order Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--border-color)] pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gold font-sans uppercase">Order #{order.id}</h2>
              <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border tracking-wider ${order.orderStatus === 'Cancelled' ? 'bg-red-100 border-red-200 text-red-800' : 'bg-gold/10 border-gold/30 text-gold'}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Progress Tracker Diagram */}
          {order.orderStatus === 'Cancelled' ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 p-6 rounded-xl text-center text-red-600 dark:text-red-400">
              This order has been cancelled and custom tailoring processes have been terminated.
            </div>
          ) : (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl shadow-sm space-y-8">
              <div className="border-b border-[var(--border-color)] pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Live Custom Tailoring Tracker</h3>
                <p className="text-[10px] text-gray-400">Track each step of your bespoke apparel crafting process below.</p>
              </div>

              {/* Horizontal steps for tablet+ */}
              <div className="hidden md:flex items-center justify-between relative">
                {/* Horizontal line connector */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-800 z-0" />
                <div 
                  className="absolute top-4 left-6 h-0.5 bg-gold transition-all duration-500 z-0" 
                  style={{ width: `${(activeIndex / (TRACKING_STAGES.length - 1)) * 100}%` }}
                />

                {TRACKING_STAGES.map((stage, idx) => {
                  const isCompleted = idx < activeIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-2 z-10 w-24">
                      <div 
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${isCompleted ? 'bg-gold border-gold text-white shadow-md' : isActive ? 'bg-[var(--bg-color)] border-gold text-gold ring-4 ring-gold/25' : 'bg-[var(--bg-color)] border-gray-300 text-gray-450'}`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider max-w-[85px] leading-tight ${isActive ? 'text-gold' : isCompleted ? 'text-gray-905' : 'text-gray-450'}`}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Vertical steps for mobile */}
              <div className="md:hidden flex flex-col gap-6 relative pl-6">
                <div className="absolute left-9 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
                <div 
                  className="absolute left-9 top-2 w-0.5 bg-gold transition-all duration-500" 
                  style={{ height: `${(activeIndex / (TRACKING_STAGES.length - 1)) * 100}%` }}
                />

                {TRACKING_STAGES.map((stage, idx) => {
                  const isCompleted = idx < activeIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <div key={idx} className="flex items-center gap-4 relative z-10">
                      <div 
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 transition-colors ${isCompleted ? 'bg-gold border-gold text-white' : isActive ? 'bg-white dark:bg-black border-gold text-gold ring-4 ring-gold/20' : 'bg-white dark:bg-black border-gray-300 text-gray-400'}`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-gold' : isCompleted ? 'opacity-90' : 'opacity-55'}`}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Items Summary */}
            <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Items Ordered</h3>
              </div>
              <div className="divide-y divide-[var(--border-color)] p-4 space-y-4">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex gap-4 pt-4 first:pt-0">
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded bg-gray-150 border border-[var(--border-color)]" />
                    <div className="flex-grow space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <span className="font-bold font-sans text-gold">${item.price}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">Size: {item.size} | Color: {item.color} | Qty: {item.qty}</p>
                      
                      {item.isCustom && item.customization && (
                        <div className="mt-2 text-xs bg-gold/10 text-gold/90 p-3 rounded border border-gold/20 space-y-2 max-w-md">
                          <p className="font-bold uppercase tracking-wider text-[9px] text-gold border-b border-gold/15 pb-1 flex items-center gap-1">
                            <FiSliders size={12} /> Custom Specs
                          </p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                            <p>Fabric: <span className="font-semibold text-gray-805 dark:text-gray-150">{item.customization.fabric}</span></p>
                            <p>Sleeve: <span className="font-semibold text-gray-805 dark:text-gray-150">{item.customization.sleeveDesign}</span></p>
                            <p>Neck: <span className="font-semibold text-gray-805 dark:text-gray-150">{item.customization.neckDesign}</span></p>
                            <p>Length: <span className="font-semibold text-gray-805 dark:text-gray-150">{item.customization.dressLength}</span></p>
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
                            <p className="text-[9px] opacity-85 font-semibold">Standard Size: {item.customization.standardSize}</p>
                          )}
                          
                          {/* Reference links */}
                          {(item.customization.inspirationUrl || item.customization.sketchUrl || item.customization.pinterestUrl) && (
                            <div className="pt-1.5 mt-1 border-t border-gold/10 text-[9px] space-y-0.5">
                              <p className="font-semibold text-[8px] uppercase tracking-wider text-gold mb-1">Design References</p>
                              {item.customization.inspirationUrl && <a href={item.customization.inspirationUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block truncate">Inspiration Image URL</a>}
                              {item.customization.sketchUrl && <a href={item.customization.sketchUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block truncate">Sketch Image URL</a>}
                              {item.customization.pinterestUrl && <a href={item.customization.pinterestUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block truncate">Pinterest Link URL</a>}
                            </div>
                          )}

                          {item.customization.specialInstructions && (
                            <div className="pt-1.5 border-t border-gold/10 text-[9px]">
                              <p className="font-semibold text-[8px] uppercase tracking-wider text-gold mb-0.5">Special Instructions</p>
                              <p className="italic opacity-85">{item.customization.specialInstructions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics Info */}
            <div className="space-y-6">
              
              {/* Shipping Address */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
                  <FiMapPin /> Delivery Location
                </h4>
                <div className="text-xs space-y-1 leading-relaxed opacity-85">
                  <p className="font-bold">{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="pt-1.5 font-medium border-t border-[var(--border-color)] mt-1.5">Phone: {order.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Billing Info */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
                  <FiCreditCard /> Financial Summary
                </h4>
                <div className="text-xs space-y-2 leading-relaxed opacity-85">
                  <div className="flex justify-between"><span>Subtotal:</span><span className="font-sans font-medium">${order.itemsPrice}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee:</span><span className="font-sans font-medium">${order.shippingPrice}</span></div>
                  <div className="flex justify-between font-bold text-gold text-sm pt-1.5 border-t border-[var(--border-color)]">
                    <span>Grand Total:</span>
                    <span className="font-sans">${order.totalPrice}</span>
                  </div>
                  <p className="pt-1 text-[10px] text-gray-400">Payment via <span className="font-semibold">{order.paymentMethod}</span></p>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
          <p className="text-sm opacity-60">No order matches that ID. Please check the spelling or search again.</p>
        </div>
      )}

      {/* Footer Nav */}
      <div className="text-center pt-6">
        <Link 
          to="/shop" 
          className="bg-gold text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
