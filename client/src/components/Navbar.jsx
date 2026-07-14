import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingBag, FiUser, FiMenu, FiLogOut, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Sync theme on mount
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Load products database for search auto-completion
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    setProductsList(products);

    // Event listener to close search dropdown when clicking outside
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = productsList.filter(p => 
      p.name.toLowerCase().includes(value.toLowerCase()) ||
      p.category.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5); // Limit suggestions to top 5
    setSuggestions(filtered);
  };

  const handleSuggestionClick = (id) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSearch(false);
    navigate(`/product/${id}`);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="fixed w-full z-50 glass top-0 border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2" aria-label="Elegance Home">
            <span className="text-2xl font-bold tracking-widest text-gold font-sans uppercase">
              Elegance
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-xs uppercase tracking-widest font-semibold hover:text-gold transition-colors">Home</Link>
            <Link to="/shop" className="text-xs uppercase tracking-widest font-semibold hover:text-gold transition-colors">Shop</Link>
            <Link to="/about" className="text-xs uppercase tracking-widest font-semibold hover:text-gold transition-colors">About</Link>
            <Link to="/faq" className="text-xs uppercase tracking-widest font-semibold hover:text-gold transition-colors">FAQ</Link>
            <Link to="/contact" className="text-xs uppercase tracking-widest font-semibold hover:text-gold transition-colors">Contact</Link>
          </div>

          {/* Search bar inside header */}
          <div className="relative flex-grow max-w-xs hidden sm:block" ref={searchRef}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FiSearch size={14} />
              </span>
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search items"
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border border-[var(--border-color)] rounded-full focus:border-gold outline-none transition-colors"
              />
            </div>
            
            {/* Search Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden z-50">
                {suggestions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-900 border-b last:border-b-0 border-[var(--border-color)]"
                  >
                    <img src={item.image} alt={item.name} className="w-8 h-10 object-cover bg-gray-200 rounded shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gold font-sans">${item.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Icons / Controls */}
          <div className="flex items-center space-x-6">
            
            {/* Dark Mode Icon */}
            <button 
              onClick={toggleTheme} 
              aria-label="Toggle contrast theme"
              className="hover:text-gold transition-colors cursor-pointer"
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Cart Link */}
            <Link to="/cart" className="relative hover:text-gold transition-colors" aria-label="Shopping Cart">
              <FiShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-white text-[9px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center">
                  {cartItems.reduce((acc, curr) => acc + curr.qty, 0)}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {userInfo ? (
              <div className="relative group cursor-pointer flex items-center gap-2">
                <FiUser size={20} className="hover:text-gold transition-colors" />
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-md shadow-lg py-1 hidden group-hover:block border border-[var(--border-color)]">
                  <div className="px-4 py-2 text-[10px] text-gray-500 uppercase tracking-widest border-b border-[var(--border-color)]">
                    Welcome, {userInfo.name}
                  </div>
                  <Link to="/admin" className="block px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 text-gold transition-colors uppercase tracking-wider font-semibold">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 uppercase tracking-wider font-semibold cursor-pointer">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/admin" className="hover:text-gold transition-colors" aria-label="Sign in dashboard">
                <FiUser size={20} />
              </Link>
            )}

            <button className="md:hidden" aria-label="Open navigation menu">
              <FiMenu size={22} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
