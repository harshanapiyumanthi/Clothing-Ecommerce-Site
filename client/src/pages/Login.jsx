import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warning('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt API server authentication
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password: password.trim()
      });

      if (response.data && response.data.success) {
        const user = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role || 'user',
          token: response.data.token
        };

        dispatch(setCredentials(user));
        toast.success(`Welcome back, ${user.name}!`);

        if (user.role === 'admin' || redirect === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        return;
      }
    } catch (error) {
      console.warn('API authentication failed, attempting local credentials fallback...', error);
    }

    // 2. Mock Standalone Credentials Fallback (For offline / local preview capability)
    if (email.trim().toLowerCase() === 'admin@elegance.com' && password.trim() === 'admin123') {
      const mockAdmin = {
        id: 'admin-mock-1',
        name: 'Atelier Admin',
        email: 'admin@elegance.com',
        role: 'admin',
        token: 'mock-jwt-token-12345'
      };
      dispatch(setCredentials(mockAdmin));
      toast.success('Successfully logged in (Atelier Preview Mode)');
      navigate('/admin');
      setLoading(false);
      return;
    }

    // Otherwise, fail
    toast.error('Invalid email or password. Use: admin@elegance.com / admin123');
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--text-color)] font-sans">
            Atelier Sign In
          </h2>
          <div className="h-0.5 w-12 bg-gold mx-auto"></div>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Access your order tracking status, personal measurements, or management dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FiMail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="admin@elegance.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent text-xs rounded-lg outline-none focus:border-gold dark:text-white"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FiLock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="admin123"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-3 border border-gray-200 dark:border-gray-800 bg-transparent text-xs rounded-lg outline-none focus:border-gold dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gold cursor-pointer"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-gold"
              />
              <label htmlFor="remember" className="text-[10px] text-gray-500 cursor-pointer">
                Remember Me
              </label>
            </div>
            <Link to="/forgot-password" className="text-[10px] text-gold hover:underline font-bold tracking-wider">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-gold/25"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center bg-gold/5 border border-gold/15 p-3 rounded-lg text-[10px] text-gray-500 leading-relaxed font-semibold">
          <span>Demo Credentials: <span className="text-gold">admin@elegance.com</span> / <span className="text-gold">admin123</span></span>
        </div>

        <div className="text-center space-y-3 pt-2">
          <p className="text-[11px] text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline font-bold uppercase tracking-wider">
              Register
            </Link>
          </p>
          <div className="h-[1px] bg-gray-200 dark:bg-gray-800 w-full my-2"></div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[10px] text-gray-400 hover:text-gold transition-colors font-bold uppercase tracking-widest"
          >
            <FiArrowLeft size={12} /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
