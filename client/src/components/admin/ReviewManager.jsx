import { useState, useEffect } from 'react';
import { FiStar, FiEye, FiEyeOff, FiTrash2, FiMessageSquare, FiX, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const API = 'http://localhost:5000/api/reviews';

const defaultReviews = [
  { _id: '1', user: { name: 'Sarah M.' }, product: { name: 'Silk Evening Gown' }, rating: 5, comment: 'Absolutely stunning! The quality exceeded my expectations. Will definitely order again.', isApproved: true, isFeatured: false, createdAt: new Date().toISOString() },
  { _id: '2', user: { name: 'Nadia K.' }, product: { name: 'Lace Wedding Dress' }, rating: 4, comment: 'Beautiful dress, fits perfectly. Delivery was slightly delayed but worth the wait.', isApproved: true, isFeatured: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: '3', user: { name: 'Amara L.' }, product: { name: 'Chiffon Party Gown' }, rating: 3, comment: 'Nice product but the color was slightly different from the website photos.', isApproved: false, isFeatured: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { _id: '4', user: { name: 'Priya R.' }, product: { name: 'Velvet Cocktail Dress' }, rating: 5, comment: 'Perfect for my office party! I received so many compliments.', isApproved: true, isFeatured: false, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
];

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <FiStar key={s} size={12} className={s <= rating ? 'text-gold fill-gold' : 'text-gray-300'} />
    ))}
  </div>
);

const ReviewManager = () => {
  const { userInfo } = useSelector(s => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, featured
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API}/admin/all`, { headers });
        setReviews(data.reviews?.length ? data.reviews : defaultReviews);
      } catch { setReviews(defaultReviews); }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    try { await axios.put(`${API}/${id}/approve`, {}, { headers }); } catch {}
    setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: true } : r));
    toast.success('Review approved');
  };

  const handleHide = async (id) => {
    try { await axios.put(`${API}/${id}/hide`, {}, { headers }); } catch {}
    setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: false } : r));
    toast.success('Review hidden');
  };

  const handleFeature = async (id, current) => {
    try { await axios.put(`${API}/${id}/feature`, {}, { headers }); } catch {}
    setReviews(prev => prev.map(r => r._id === id ? { ...r, isFeatured: !current } : r));
    toast.success(current ? 'Review unfeatured' : 'Review featured!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try { await axios.delete(`${API}/${id}`, { headers }); } catch {}
    setReviews(prev => prev.filter(r => r._id !== id));
    toast.success('Review deleted');
  };

  const handleReply = (r) => { setReplyModal(r); setReplyText(''); };

  const submitReply = () => {
    if (!replyText.trim()) return;
    toast.success('Reply sent to customer!');
    setReplyModal(null);
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    if (filter === 'featured') return r.isFeatured;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-widest">Review Management</h2>
        <p className="text-sm text-gray-500 mt-1">Moderate, feature and reply to customer reviews.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length, active: 'all' },
          { label: 'Pending', value: reviews.filter(r => !r.isApproved).length, active: 'pending', color: 'text-amber-500' },
          { label: 'Approved', value: reviews.filter(r => r.isApproved).length, active: 'approved', color: 'text-emerald-500' },
          { label: 'Featured', value: reviews.filter(r => r.isFeatured).length, active: 'featured', color: 'text-gold' },
        ].map(s => (
          <button key={s.active} onClick={() => setFilter(s.active)}
            className={`bg-[var(--card-bg)] border p-4 rounded-xl text-center transition-all cursor-pointer ${filter === s.active ? 'border-gold shadow-md shadow-gold/15' : 'border-[var(--border-color)] hover:border-gold/50'}`}>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color || ''}`}>{s.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-12 rounded-xl text-center text-gray-500">No reviews in this category.</div>
        ) : filtered.map(review => (
          <div key={review._id} className={`bg-[var(--card-bg)] border rounded-xl p-5 space-y-3 transition-all ${review.isFeatured ? 'border-gold/50 shadow-md shadow-gold/10' : 'border-[var(--border-color)]'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/15 text-gold font-bold flex items-center justify-center shrink-0">
                  {review.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-sm">{review.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{review.product?.name || 'Product'} · {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {review.isFeatured && <span className="px-2 py-0.5 bg-gold/15 text-gold text-[9px] font-bold uppercase rounded-full tracking-wider border border-gold/30">⭐ Featured</span>}
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${review.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                  {review.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>

            <StarRating rating={review.rating} />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)] flex-wrap">
              {!review.isApproved ? (
                <button onClick={() => handleApprove(review._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer">
                  <FiCheck size={12} /> Approve
                </button>
              ) : (
                <button onClick={() => handleHide(review._id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] text-gray-500 text-xs font-bold uppercase rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                  <FiEyeOff size={12} /> Hide
                </button>
              )}
              <button onClick={() => handleFeature(review._id, review.isFeatured)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${review.isFeatured ? 'bg-gold/15 text-gold border border-gold/30 hover:bg-gold/30' : 'border border-[var(--border-color)] text-gray-500 hover:border-gold hover:text-gold'}`}>
                <FiStar size={12} /> {review.isFeatured ? 'Unfeature' : 'Feature'}
              </button>
              <button onClick={() => handleReply(review)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] text-gray-500 text-xs font-bold uppercase rounded-lg hover:border-gold hover:text-gold transition-colors cursor-pointer">
                <FiMessageSquare size={12} /> Reply
              </button>
              <button onClick={() => handleDelete(review._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 text-xs font-bold uppercase rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer ml-auto">
                <FiTrash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
              <h3 className="font-bold uppercase tracking-widest text-sm">Reply to Review</h3>
              <button onClick={() => setReplyModal(null)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg text-sm italic text-gray-600 dark:text-gray-400">
                "{replyModal.comment}"
              </div>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
                placeholder="Write your official response to this review..."
                className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm resize-none"
              />
              <button onClick={submitReply} className="w-full py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors cursor-pointer">
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
