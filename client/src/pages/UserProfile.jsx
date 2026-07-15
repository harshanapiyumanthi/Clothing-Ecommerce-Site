import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiPackage, FiMapPin, FiPhone, FiMail, FiCalendar, FiStar, FiRotateCcw, FiBell, FiCamera, FiLock, FiPlus, FiTrash2, FiHelpCircle, FiSend } from 'react-icons/fi';
import Breadcrumb from '../components/Breadcrumb';

const UserProfile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [addresses, setAddresses] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [savedDesigns, setSavedDesigns] = useState([]);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=profile');
      return;
    }

    setProfileData({
      name: userInfo.name || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '077 123 4567'
    });

    setAddresses([
      { id: 1, type: 'Home', address: '123 Atelier Lane', city: 'Colombo', postalCode: '00700', isDefault: true },
      { id: 2, type: 'Office', address: '45 Business Park', city: 'Colombo', postalCode: '00300', isDefault: false }
    ]);

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
    if (!profileData.name.trim()) {
      toast.warning('Name is required.');
      return;
    }

    const updatedUser = {
      ...userInfo,
      name: profileData.name,
      phone: profileData.phone
    };

    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    toast.success('Profile details saved successfully!');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.warning('All password fields are required.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Password updated successfully! (Simulated)');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderOrderTimeline = (order) => {
    const isCustomOrder = order.orderItems?.some(item => item.isCustom);
    const steps = isCustomOrder ? [
      'Received', 'Design Review', 'Cutting', 'Tailoring', 'Quality Check', 'Ready', 'Delivered'
    ] : [
      'Received', 'Processing', 'Shipped', 'Delivered'
    ];

    let currentStatus = order.orderStatus || 'Received';
    if (currentStatus === 'Order Received') currentStatus = 'Received';

    const currentIndex = steps.findIndex(
      step => step.toLowerCase() === currentStatus.toLowerCase()
    );

    return (
      <div className="w-full py-4 border-b border-[var(--border-color)] overflow-x-auto mb-4">
        <div className="flex items-center justify-between min-w-[500px] relative px-4">
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-250 dark:bg-gray-800 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-3 left-0 h-0.5 bg-gold -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
          />
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

  const NavButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 lg:w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
        activeTab === id
          ? 'bg-gold text-white shadow-sm shadow-gold/25'
          : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[var(--text-color)]'
      }`}
    >
      <Icon size={14} /> <span className="hidden lg:inline sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8 min-h-screen">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="relative inline-block group">
                <div className="h-20 w-20 bg-gold/15 text-gold border border-gold/30 rounded-full flex items-center justify-center font-bold text-3xl mx-auto uppercase overflow-hidden">
                  {avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : (userInfo?.name ? userInfo.name.charAt(0) : 'U')}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-gold text-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-black transition-colors"
                >
                  <FiCamera size={12} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">{userInfo?.name || 'Customer'}</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{userInfo?.email}</p>
              </div>
            </div>

            <div className="h-[1px] bg-[var(--border-color)]"></div>

            <nav className="flex lg:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
              <NavButton id="profile" icon={FiUser} label="Profile & Security" />
              <NavButton id="addresses" icon={FiMapPin} label="Address Book" />
              <NavButton id="orders" icon={FiPackage} label="Order History" />
              {userInfo?.membershipTier === 'Premium' && (
                <NavButton id="studio" icon={FiStar} label="Studio Collection" />
              )}
              <NavButton id="rewards" icon={FiStar} label="Rewards & Membership" />
              <NavButton id="returns" icon={FiRotateCcw} label="Returns" />
              <NavButton id="notifications" icon={FiBell} label="Notifications" />
              <NavButton id="support" icon={FiHelpCircle} label="Help & Support" />
            </nav>
          </div>
        </aside>

        {/* Content Details */}
        <main className="flex-grow">
          {activeTab === 'studio' && userInfo?.membershipTier === 'Premium' && (
            <div className="space-y-6">
              <div className="bg-[var(--card-bg)] border border-gold/45 p-6 sm:p-8 rounded-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20"></div>
                <div className="border-b border-gold/20 pb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h2 className="text-lg font-bold uppercase tracking-widest text-gold">
                    My Studio Collection
                  </h2>
                </div>
                
                {savedDesigns.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                      <FiStar className="text-gold text-2xl" />
                    </div>
                    <p>You haven't saved any customized designs yet.</p>
                    <p className="mt-1">Explore our collections and use the Dream Dress Studio to create your look!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Map saved designs here */}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                  <FiUser className="text-gold" size={20} />
                  <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">
                    Personal Details
                  </h2>
                </div>

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold opacity-60 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px]">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow-sm cursor-pointer"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                  <FiLock className="text-gold" size={20} />
                  <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">
                    Security & Password
                  </h2>
                </div>

                <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-6 text-xs max-w-md">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px]">Current Password</label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px]">New Password</label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-555 uppercase tracking-wide text-[10px]">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gold dark:hover:bg-gold hover:text-white text-[var(--text-color)] text-xs font-bold uppercase tracking-widest rounded transition-colors shadow-sm cursor-pointer"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gold" size={20} />
                  <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">
                    Address Book
                  </h2>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-black transition-colors cursor-pointer">
                  <FiPlus /> Add New
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="border border-[var(--border-color)] p-5 rounded-xl relative hover:border-gold transition-colors">
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded">Default</span>
                    )}
                    <h3 className="font-bold text-sm mb-2">{addr.type}</h3>
                    <div className="text-xs text-gray-500 space-y-0.5 mb-4">
                      <p>{profileData.name}</p>
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.postalCode}</p>
                      <p>Sri Lanka</p>
                      <p className="mt-2">Phone: {profileData.phone}</p>
                    </div>
                    <div className="flex gap-4 border-t border-[var(--border-color)] pt-3">
                      <button className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gold transition-colors cursor-pointer">Edit</button>
                      <button className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"><FiTrash2 /> Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-900 border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                <FiPackage className="text-gold" size={20} />
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

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* Membership Status Card */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${userInfo?.membershipTier === 'Premium' ? 'bg-gold' : userInfo?.membershipTier === 'VIP' ? 'bg-black' : 'bg-gray-300'}`}></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Current Membership</h2>
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl font-bold uppercase tracking-wider ${userInfo?.membershipTier === 'Premium' ? 'text-gold' : userInfo?.membershipTier === 'VIP' ? 'text-[var(--text-color)]' : 'text-gray-400'}`}>
                        {userInfo?.membershipTier || 'Free'}
                      </span>
                      {userInfo?.membershipTier !== 'Free' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full">Active</span>
                      )}
                    </div>
                    {userInfo?.membershipTier !== 'Free' && userInfo?.membershipExpiry && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">Expires on: {new Date(userInfo.membershipExpiry).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {userInfo?.membershipTier === 'Free' ? (
                      <button onClick={() => navigate('/membership')} className="px-6 py-3 bg-gold text-white text-xs font-bold uppercase tracking-widest rounded shadow-lg shadow-gold/20 hover:bg-black transition-colors">
                        Upgrade Membership
                      </button>
                    ) : (
                      <>
                        <button onClick={() => navigate('/membership')} className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gold transition-colors">
                          Renew Membership
                        </button>
                        <button onClick={() => navigate('/membership')} className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-color)] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          Compare Plans
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Reward Points Card */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
                    <FiStar size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold font-sans text-[var(--text-color)]">
                      {userInfo?.rewardPoints || 0} <span className="text-sm text-gray-500 font-normal">pts</span>
                    </h3>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Available Balance</p>
                  </div>
                </div>
                
                <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-6 md:pt-0 md:pl-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Redeem Points</h4>
                  <p className="text-[10px] text-gray-500 max-w-xs mb-4 leading-relaxed">Exchange your points for exclusive discount coupons. 100 points = $10 discount on your next order.</p>
                  <button className="w-full px-4 py-2 bg-transparent border border-gold text-gold hover:bg-gold hover:text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors">
                    View Rewards Catalog
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiRotateCcw className="text-gold" size={20} />
                  <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">Returns & Exchanges</h2>
                </div>
                <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gold hover:text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                  New Request
                </button>
              </div>
              <div className="text-center py-12 text-gray-400">
                <FiRotateCcw size={36} className="mx-auto text-gray-300 mb-3 stroke-1" />
                <p className="text-xs font-semibold">No active return requests.</p>
                <p className="text-[10px] mt-1">If you need to return an item, click 'New Request' above.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                <FiBell className="text-gold" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex items-start gap-4 transition-colors hover:bg-gold/10 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <FiPackage size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-color)]">Order Shipped</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Your order #ord-1204 has been shipped and is on its way to you.</p>
                    <p className="text-[9px] text-gold font-semibold mt-2 uppercase tracking-wider">2 days ago</p>
                  </div>
                </div>
                <div className="p-4 border border-[var(--border-color)] rounded-xl flex items-start gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
                    <FiStar size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-color)]">Welcome to Elegance</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Thank you for joining. Explore our latest luxury collections.</p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-2 uppercase tracking-wider">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                <FiHelpCircle className="text-gold" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">Help & Support</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm">Need Assistance?</h3>
                  <p className="text-gray-500 leading-relaxed">Our fashion consultants and support team are available 24/7 to assist you with sizing, custom orders, and returns.</p>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><FiPhone className="text-gold" /> +94 11 234 5678</p>
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><FiMail className="text-gold" /> support@elegance.com</p>
                  </div>
                </div>

                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success('Message sent to support!'); }}>
                  <input type="text" placeholder="Subject" className="w-full px-4 py-2 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold" required />
                  <textarea rows="4" placeholder="How can we help you today?" className="w-full px-4 py-2 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold resize-none" required></textarea>
                  <button type="submit" className="w-full py-2.5 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-gold/20">
                    <FiSend /> Send Message
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default UserProfile;
