import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiPackage, FiMapPin, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';
import Breadcrumb from '../components/Breadcrumb';

const UserProfile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=profile');
      return;
    }

    setProfileData({
      name: userInfo.name || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '077 123 4567',
      address: userInfo.address || '123 Atelier Lane',
      city: userInfo.city || 'Colombo',
      postalCode: userInfo.postalCode || '00700'
    });

    const allOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    const filtered = allOrders.filter(o => o.user?.email?.toLowerCase() === userInfo.email?.toLowerCase());
    
    if (filtered.length === 0) {
      const mockOrder = {
        id: 'ord-1204',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        totalPrice: 349.00,
        orderStatus: 'Shipped',
        paymentMethod: 'Stripe',
        isPaid: true,
        orderItems: [
          {
            name: 'Silk Evening Gown',
            qty: 1,
            price: 299.00,
            size: 'M',
            color: '#be123c',
            image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=2071&auto=format&fit=crop'
          },
          {
            name: 'Gold Ring Accessory',
            qty: 1,
            price: 50.00,
            size: 'One Size',
            color: 'Neutral',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop'
          }
        ]
      };
      setUserOrders([mockOrder]);
    } else {
      setUserOrders(filtered);
    }
  }, [userInfo, navigate]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast.warning('Name and Email are required.');
      return;
    }

    const updatedUser = {
      ...userInfo,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      postalCode: profileData.postalCode
    };

    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    toast.success('Profile details saved successfully!');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const renderOrderTimeline = (order) => {
    // Determine the list of steps to show
    const isCustomOrder = order.orderItems?.some(item => item.isCustom);
    const steps = isCustomOrder ? [
      'Received', 'Design Review', 'Cutting', 'Tailoring', 'Quality Check', 'Ready', 'Delivered'
    ] : [
      'Received', 'Processing', 'Shipped', 'Delivered'
    ];

    // Find the index of the current status
    // Map order.orderStatus (e.g. 'Order Received' maps to 'Received')
    let currentStatus = order.orderStatus || 'Received';
    if (currentStatus === 'Order Received') currentStatus = 'Received';

    const currentIndex = steps.findIndex(
      step => step.toLowerCase() === currentStatus.toLowerCase()
    );

    return (
      <div className="w-full py-4 border-b border-[var(--border-color)] overflow-x-auto mb-4">
        <div className="flex items-center justify-between min-w-[500px] relative px-4">
          {/* Connector Line */}
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-250 dark:bg-gray-800 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-3 left-0 h-0.5 bg-gold -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
          />

          {/* Steps */}
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            return (
              <div key={step} className="flex flex-col items-center relative z-10 space-y-1">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gold text-white scale-110 shadow-sm shadow-gold/25' 
                      : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-gray-400'
                  } ${isActive ? 'ring-4 ring-gold/20' : ''}`}
                >
                  {idx + 1}
                </div>
                <span 
                  className={`text-[8px] uppercase tracking-wider font-extrabold whitespace-nowrap ${
                    isActive ? 'text-gold' : isCompleted ? 'text-[var(--text-color)]' : 'text-gray-405'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const breadcrumbItems = [{ label: 'My Profile', link: '/profile' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 bg-gold/15 text-gold border border-gold/30 rounded-full flex items-center justify-center font-bold text-2xl mx-auto uppercase">
                {userInfo?.name ? userInfo.name.charAt(0) : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">{userInfo?.name || 'Customer'}</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{userInfo?.email}</p>
              </div>
            </div>

            <div className="h-[1px] bg-[var(--border-color)]"></div>

            <nav className="flex lg:flex-col gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 lg:w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-gold text-white shadow-sm shadow-gold/25'
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[var(--text-color)]'
                }`}
              >
                <FiUser size={14} /> Profile details
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 lg:w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-gold text-white shadow-sm shadow-gold/25'
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[var(--text-color)]'
                }`}
              >
                <FiPackage size={14} /> Order History
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Details */}
        <main className="flex-grow">
          {activeTab === 'profile' ? (
            <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3">
                <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">
                  My Profile Details
                </h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px] flex items-center gap-1.5"><FiUser className="text-gold" /> Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px] flex items-center gap-1.5"><FiMail className="text-gold" /> Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold opacity-60 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px] flex items-center gap-1.5"><FiPhone className="text-gold" /> Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px] flex items-center gap-1.5"><FiMapPin className="text-gold" /> Delivery Address</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px] flex items-center gap-1.5"><FiMapPin className="text-gold" /> City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px] flex items-center gap-1.5"><FiMapPin className="text-gold" /> Postal Code</label>
                  <input
                    type="text"
                    value={profileData.postalCode}
                    onChange={e => setProfileData({ ...profileData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 pt-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow-sm shadow-gold/20 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3">
                <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">
                  My Order History
                </h2>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FiPackage size={36} className="mx-auto text-gray-300 mb-2 stroke-1" />
                  <p className="text-xs">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm"
                    >
                      <div className="bg-gray-50 dark:bg-gray-850 p-4 flex flex-wrap justify-between items-center gap-4 text-xs border-b border-[var(--border-color)]">
                        <div className="flex gap-6 flex-wrap">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Order Placed</p>
                            <p className="font-bold flex items-center gap-1 mt-0.5 text-gray-650 dark:text-gray-300">
                              <FiCalendar size={12} className="text-gold" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Cost</p>
                            <p className="font-bold text-gold mt-0.5">${order.totalPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Order ID</p>
                            <p className="font-bold font-mono mt-0.5">{order.id}</p>
                          </div>
                        </div>

                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.orderStatus === 'Delivered' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : order.orderStatus === 'Shipped' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' 
                              : 'bg-gold/15 text-gold'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Status Timeline */}
                        {renderOrderTimeline(order)}

                        {order.orderItems?.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80'}
                              alt={item.name}
                              className="w-12 h-16 object-cover bg-gray-150 rounded border border-[var(--border-color)] shrink-0"
                            />
                            <div className="flex-grow text-xs space-y-0.5">
                              <h4 className="font-bold line-clamp-1">{item.name}</h4>
                              <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400 font-semibold uppercase">
                                <span>Qty: {item.qty}</span>
                                <span>Size: {item.size}</span>
                                {item.color && (
                                  <span className="flex items-center gap-1">
                                    Color: 
                                    <span style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" />
                                  </span>
                                )}
                              </div>
                              {item.isCustom && (
                                <p className="text-[10px] text-gold font-bold">Tailoring Specs Custom Applied</p>
                              )}
                            </div>
                            <div className="text-xs font-bold text-gold shrink-0 font-sans">
                              ${item.price}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
