import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FiCheck, FiLock } from 'react-icons/fi';

const DreamDressStudio = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load draft from local storage on mount
  useEffect(() => {
    const draft = localStorage.getItem('dream_dress_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.selectedOptions) setSelectedOptions(parsed.selectedOptions);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.timestamp) setLastSaved(new Date(parsed.timestamp));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Auto-save debounced effect
  useEffect(() => {
    if (Object.keys(selectedOptions).length > 0 || description) {
      const timeoutId = setTimeout(() => {
        const draft = {
          selectedOptions,
          description,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('dream_dress_draft', JSON.stringify(draft));
        setLastSaved(new Date());
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedOptions, description]);

  useEffect(() => {
    if (!userInfo) {
      toast.error('Please log in to access the Dream Dress Studio');
      navigate('/login');
      return;
    }

    const fetchOptions = async () => {
      try {
        const { data } = await axios.get('/api/customizations');
        setOptions(data.options);
      } catch (error) {
        toast.error('Failed to load studio options');
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [userInfo, navigate]);

  const groupedOptions = options.reduce((acc, opt) => {
    if (!acc[opt.type]) acc[opt.type] = [];
    acc[opt.type].push(opt);
    return acc;
  }, {});

  const handleSelect = (type, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [type]: option,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedOptions).length === 0) {
      return toast.warning('Please select at least one customization option.');
    }

    try {
      setSubmitting(true);
      const customizations = Object.values(selectedOptions).map((opt) => ({
        optionType: opt.type,
        optionValue: opt.value,
        optionRef: opt._id,
      }));

      await axios.post('/api/custom-orders', {
        description,
        customizations,
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success('Your Dream Dress order has been received!');
      localStorage.removeItem('dream_dress_draft'); // Clear draft on success
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!userInfo) return null;

  if (userInfo.membershipTier !== 'Premium' && userInfo.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <FiLock className="mx-auto text-gold text-6xl mb-6" />
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)] mb-4">Dream Dress Studio</h1>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">This exclusive studio is reserved for Premium Members. Upgrade your membership to design your own bespoke luxury garments tailored exactly to your specifications.</p>
        <button 
          onClick={() => navigate('/profile')}
          className="bg-gold text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-widest text-[var(--text-color)]">Dream Dress Studio</h1>
        <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">Design your perfect dress from our curated selection of premium options. Our master tailors will bring your vision to life.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading studio assets...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-12">
          {Object.entries(groupedOptions).map(([type, opts]) => (
            <div key={type} className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--border-color)] pb-2 text-[var(--text-color)]">{type}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {opts.map((opt) => {
                  const isSelected = selectedOptions[type]?._id === opt._id;
                  return (
                    <div 
                      key={opt._id}
                      onClick={() => handleSelect(type, opt)}
                      className={`relative p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-gold bg-gold/10 shadow-md' : 'border-[var(--border-color)] hover:border-gold/50'}`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-gold text-white p-1 rounded-full text-xs">
                          <FiCheck />
                        </div>
                      )}
                      <h4 className="text-sm font-semibold text-center mt-2">{opt.value}</h4>
                      {opt.additionalPrice > 0 && (
                        <p className="text-xs text-center text-gold mt-1">+${opt.additionalPrice}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--border-color)] pb-2 text-[var(--text-color)]">Additional Notes</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe any specific measurements or requirements here..."
              className="w-full p-4 border border-[var(--border-color)] bg-transparent rounded outline-none focus:border-gold text-sm"
              rows={4}
              required
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gold text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors disabled:opacity-50 shadow-lg shadow-gold/20"
            >
              {submitting ? 'Submitting Design...' : 'Submit Design to Tailors'}
            </button>
            {lastSaved && (
              <p className="text-[10px] text-gray-500 mt-3 font-semibold uppercase tracking-wider">
                Draft securely auto-saved at {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default DreamDressStudio;
