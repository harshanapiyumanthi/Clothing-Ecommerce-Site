import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiMenu, FiX, FiGrid, FiBox, FiLayers, FiShoppingCart, FiUsers, 
  FiTrendingUp, FiHeart, FiSettings, FiMoon, FiSun, FiBell, FiLogOut, FiSliders, FiStar, FiMessageSquare
} from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
  
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login?redirect=admin');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    // Core
    { id: 'dashboard',      name: 'Dashboard',            icon: <FiGrid size={16} />,        group: 'Overview' },
    // Catalogue
    { id: 'products',       name: 'Products',             icon: <FiBox size={16} />,         group: 'Catalogue' },
    { id: 'categories',     name: 'Categories',           icon: <FiLayers size={16} />,      group: 'Catalogue' },
    { id: 'colors',         name: 'Colors',               icon: <FiSliders size={16} />,     group: 'Catalogue' },
    { id: 'fabrics',        name: 'Fabrics',              icon: <FiSliders size={16} />,     group: 'Catalogue' },
    { id: 'inventory',      name: 'Inventory',            icon: <FiBox size={16} />,         group: 'Catalogue' },
    // Orders
    { id: 'orders',         name: 'Orders',               icon: <FiShoppingCart size={16} />, group: 'Orders' },
    { id: 'customizations', name: 'Customization Orders', icon: <FiSliders size={16} />,     group: 'Orders' },
    { id: 'recommendations',name: 'Recommendations',      icon: <FiHeart size={16} />,       group: 'Orders' },
    // Customers
    { id: 'customers',      name: 'Customers',            icon: <FiUsers size={16} />,       group: 'Customers' },
    { id: 'crm',            name: 'CRM & Support',        icon: <FiMessageSquare size={16} />, group: 'Customers' },
    { id: 'memberships',    name: 'Membership & Loyalty', icon: <FiStar size={16} />,        group: 'Customers' },
    { id: 'coupons',        name: 'Coupons',              icon: <FiGrid size={16} />,        group: 'Customers' },
    // Content
    { id: 'reviews',        name: 'Reviews',              icon: <FiStar size={16} />,        group: 'Content' },
    { id: 'marketing',      name: 'Marketing',            icon: <FiTrendingUp size={16} />,  group: 'Content' },
    { id: 'content',        name: 'Content Pages',        icon: <FiLayers size={16} />,      group: 'Content' },
    // Business
    { id: 'reports',        name: 'Reports',              icon: <FiTrendingUp size={16} />,  group: 'Business' },
    { id: 'settings',       name: 'Settings',             icon: <FiSettings size={16} />,    group: 'Business' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex transition-colors duration-300">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-[var(--card-bg)] border-r border-[var(--border-color)] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div>
          {/* Sidebar Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-widest text-gold font-sans uppercase">
                Elegance
              </span>
              <span className="text-xs uppercase bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 font-semibold tracking-wider rounded">
                Admin
              </span>
            </Link>
            <button 
              className="md:hidden text-gray-500 hover:text-gold p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
            {(() => {
              const groups = [...new Set(navItems.map(i => i.group))];
              return groups.map(group => (
                <div key={group}>
                  <p className="px-3 pt-4 pb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">{group}</p>
                  {navItems.filter(i => i.group === group).map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition-all rounded-lg duration-200 cursor-pointer ${
                        activeTab === item.id
                          ? 'bg-gold text-white shadow-md shadow-gold/20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[var(--text-color)]'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              ));
            })()}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--border-color)] space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-full bg-gold/10 text-gold border border-gold/20 flex items-center justify-center font-bold text-lg">
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-semibold truncate">{userInfo?.name || 'Administrator'}</h4>
              <p className="text-xs text-gray-500 truncate">{userInfo?.email || 'admin@elegance.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase text-red-500 hover:bg-red-500/10 transition-colors rounded cursor-pointer"
          >
            <FiLogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-[var(--card-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
          
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-500 hover:text-gold p-1 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-bold uppercase tracking-widest hidden sm:block">
              {navItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Notification Badge */}
            <div className="relative group">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer">
                <FiBell size={20} />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-gold rounded-full ring-2 ring-[var(--card-bg)] animate-ping" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-gold rounded-full ring-2 ring-[var(--card-bg)]" />
              </button>
              <div className="absolute right-0 mt-2 w-80 glass rounded-lg shadow-lg border border-[var(--border-color)] py-2 hidden group-hover:block z-50">
                <div className="px-4 py-2 border-b border-[var(--border-color)] font-semibold text-sm">
                  Notifications
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <p className="text-xs text-gray-500">Just now</p>
                    <p className="text-sm">New customization order received from Sarah.</p>
                  </div>
                  <div className="px-4 py-3 border-b border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <p className="text-xs text-gray-500">2 hours ago</p>
                    <p className="text-sm">Product 'Silk Evening Gown' is low in stock (3 remaining).</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <p className="text-xs text-gray-500">1 day ago</p>
                    <p className="text-sm">Revenue report generated for June.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Mini Profile */}
            <div className="flex items-center gap-3 border-l border-[var(--border-color)] pl-4 sm:pl-6">
              <div className="h-9 w-9 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm shadow-md">
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs text-gray-500 font-medium">Administrator</p>
                <p className="text-sm font-semibold">{userInfo?.name || 'Admin User'}</p>
              </div>
            </div>

          </div>

        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
