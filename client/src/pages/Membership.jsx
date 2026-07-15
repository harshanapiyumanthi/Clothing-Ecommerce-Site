import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiAward, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/Breadcrumb';

const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  // Hardcoded fallback data just in case db is empty
  const defaultPlans = [
    {
      _id: 'free',
      name: 'Free',
      price: 0,
      badgeColor: '#6B7280',
      features: [
        'Browse & Search Products',
        'Wishlist & Shopping Cart',
        'Standard Ready-Made Sizes',
        'Standard Order Tracking',
        'Returns & Exchanges'
      ]
    },
    {
      _id: 'premium',
      name: 'Premium',
      price: 19.99,
      badgeColor: '#D4AF37', // Gold
      features: [
        'All Free Features',
        'Unlock Dream Dress Studio',
        'Personalize Designer Collections',
        'Save Customized Designs',
        'Priority Production & Shipping',
        'Exclusive Seasonal Collections',
        'Birthday Gift Coupons',
        'Premium Reward Points Multiplier'
      ]
    },
    {
      _id: 'vip',
      name: 'VIP',
      price: 49.99,
      badgeColor: '#000000', // Black/Platinum
      features: [
        'All Premium Features',
        'Personal Fashion Consultant',
        'Designer Appointment Booking',
        'Virtual Styling Sessions',
        'Exclusive Luxury Collections',
        'Invitation-only Fashion Events',
        'Dedicated Customer Manager'
      ]
    }
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/memberships');
        if (data.success && data.plans.length > 0) {
          setPlans(data.plans);
        } else {
          setPlans(defaultPlans);
        }
      } catch (error) {
        setPlans(defaultPlans);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (plan) => {
    if (!userInfo) {
      toast.warning('Please log in to upgrade your membership.');
      navigate('/login?redirect=membership');
      return;
    }

    if (plan.name === 'Free') {
      return; // Already free or down-grading not supported here
    }

    if (userInfo.membershipTier === plan.name) {
      toast.info(`You are already a ${plan.name} member!`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/memberships/upgrade',
        { planId: plan._id },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      if (data.success) {
        toast.success(data.message);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        // Redirect to profile
        navigate('/profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (name) => {
    if (name === 'VIP') return <FiAward size={24} />;
    if (name === 'Premium') return <FiStar size={24} />;
    return <FiShield size={24} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Membership Plans', link: '/membership' }]} />
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-[var(--text-color)] font-sans">
            Elegance <span className="text-gold">Club</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
            Join an exclusive fashion community. Enhance your shopping experience with premium services, bespoke personalizations, and priority rewards. Upgrade because you want to, not because you have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={plan._id || plan.name}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border ${plan.name === 'Premium' ? 'border-gold shadow-gold/20 scale-105 z-10' : 'border-[var(--border-color)]'}`}
            >
              {plan.name === 'Premium' && (
                <div className="absolute top-0 left-0 right-0 bg-gold text-white text-center text-[10px] font-bold uppercase tracking-widest py-1.5">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.name === 'Premium' ? 'pt-10' : ''}`}>
                <div className="flex items-center gap-3 mb-4" style={{ color: plan.badgeColor }}>
                  {getIcon(plan.name)}
                  <h3 className="text-xl font-bold uppercase tracking-wider">{plan.name}</h3>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--text-color)] font-sans">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && <span className="text-gray-500 text-sm"> / month</span>}
                </div>

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading || plan.name === 'Free' || userInfo?.membershipTier === plan.name}
                  className={`w-full py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                    userInfo?.membershipTier === plan.name 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : plan.name === 'Premium' 
                        ? 'bg-gold text-white hover:bg-black hover:text-white shadow-lg shadow-gold/30'
                        : plan.name === 'VIP'
                          ? 'bg-black text-white hover:bg-gold shadow-lg'
                          : 'bg-transparent border border-[var(--border-color)] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {userInfo?.membershipTier === plan.name 
                    ? 'Current Plan' 
                    : plan.name === 'Free' 
                      ? 'Included' 
                      : loading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              </div>

              <div className="px-8 pb-8 space-y-4 bg-gray-50/50 dark:bg-gray-800/50 pt-6 border-t border-[var(--border-color)]">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[var(--text-color)]">
                    <div className="mt-0.5 shrink-0" style={{ color: plan.badgeColor }}>
                      <FiCheck size={16} />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Additional FAQs or Details */}
        <div className="mt-24 text-center max-w-2xl mx-auto space-y-4">
          <h4 className="text-lg font-bold uppercase tracking-widest text-[var(--text-color)]">Questions about membership?</h4>
          <p className="text-sm text-gray-500">
            Our support team is available 24/7. Premium and VIP members receive priority queueing.
            You can cancel or downgrade your membership at any time from your profile dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Membership;
