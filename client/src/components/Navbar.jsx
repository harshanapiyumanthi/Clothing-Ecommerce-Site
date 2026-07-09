import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingBag, FiUser, FiMenu, FiLogOut } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="fixed w-full z-50 glass top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl font-bold tracking-widest text-gold font-sans uppercase">
              Elegance
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-sm uppercase tracking-wider hover:text-gold transition-colors">Home</Link>
            <Link to="/shop" className="text-sm uppercase tracking-wider hover:text-gold transition-colors">Shop</Link>
            <Link to="/categories" className="text-sm uppercase tracking-wider hover:text-gold transition-colors">Collections</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="relative hover:text-gold transition-colors">
              <FiShoppingBag size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {userInfo ? (
              <div className="relative group cursor-pointer flex items-center gap-2">
                <FiUser size={22} className="hover:text-gold transition-colors" />
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-200 dark:border-gray-800">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                    Welcome, {userInfo.name}
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    My Profile
                  </Link>
                  {userInfo.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 text-gold transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hover:text-gold transition-colors">
                <FiUser size={22} />
              </Link>
            )}

            <button className="md:hidden">
              <FiMenu size={24} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
