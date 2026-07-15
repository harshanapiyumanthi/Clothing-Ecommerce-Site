import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiImage, FiZap, FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';

const defaultBanners = [
  { id: '1', title: 'Summer Collection', subtitle: 'Up to 40% off on selected items', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400', link: '/shop?category=summer', isActive: true, order: 1 },
  { id: '2', title: 'Wedding Season', subtitle: 'Exclusive bridal collections', imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1400', link: '/shop?tag=wedding', isActive: true, order: 2 },
  { id: '3', title: 'Dream Dress Studio', subtitle: 'Premium personalization now available', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1400', link: '/membership', isActive: false, order: 3 },
];

const defaultAnnouncements = [
  { id: '1', text: 'Free shipping on all orders over $150! Limited time offer.', isActive: true },
  { id: '2', text: 'Dream Dress Studio — Now open for Premium Members.', isActive: true },
];

const MarketingManager = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState(defaultBanners);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '', link: '', isActive: true, order: 1 });
  const [announcementText, setAnnouncementText] = useState('');

  const openBannerCreate = () => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', imageUrl: '', link: '', isActive: true, order: banners.length + 1 }); setShowModal(true); };
  const openBannerEdit = (b) => { setEditingBanner(b); setBannerForm({ title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, link: b.link, isActive: b.isActive, order: b.order }); setShowModal(true); };

  const saveBanner = (e) => {
    e.preventDefault();
    if (editingBanner) {
      setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...bannerForm } : b));
      toast.success('Banner updated!');
    } else {
      setBanners(prev => [...prev, { id: Date.now().toString(), ...bannerForm }]);
      toast.success('Banner created!');
    }
    setShowModal(false);
  };

  const deleteBanner = (id) => { setBanners(prev => prev.filter(b => b.id !== id)); toast.success('Banner deleted'); };
  const toggleBanner = (id) => { setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b)); };

  const addAnnouncement = () => {
    if (!announcementText.trim()) return;
    setAnnouncements(prev => [...prev, { id: Date.now().toString(), text: announcementText, isActive: true }]);
    setAnnouncementText('');
    toast.success('Announcement added!');
  };

  const deleteAnnouncement = (id) => { setAnnouncements(prev => prev.filter(a => a.id !== id)); };
  const toggleAnnouncement = (id) => { setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a)); };

  const tabs = [
    { id: 'banners', label: 'Homepage Banners', icon: <FiImage size={14} /> },
    { id: 'announcements', label: 'Announcements', icon: <FiBell size={14} /> },
    { id: 'flash', label: 'Flash Sales', icon: <FiZap size={14} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-widest">Marketing & Promotions</h2>
        <p className="text-sm text-gray-500 mt-1">Manage homepage banners, announcements and flash sale campaigns.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === tab.id ? 'bg-gold text-white shadow-sm' : 'text-gray-500 hover:text-[var(--text-color)]'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openBannerCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors cursor-pointer">
              <FiPlus /> Add Banner
            </button>
          </div>
          <div className="space-y-3">
            {banners.map(banner => (
              <div key={banner.id} className={`bg-[var(--card-bg)] border rounded-xl overflow-hidden transition-all ${banner.isActive ? 'border-[var(--border-color)]' : 'border-dashed border-gray-300 dark:border-gray-700 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-28 bg-gray-200 dark:bg-gray-800 shrink-0 overflow-hidden">
                    {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold">{banner.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{banner.subtitle}</p>
                      <p className="text-xs text-gold font-mono mt-2">{banner.link}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${banner.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                        {banner.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-xs text-gray-400">Order: {banner.order}</span>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => toggleBanner(banner.id)} className="px-3 py-1 text-xs border border-[var(--border-color)] rounded hover:border-gold hover:text-gold cursor-pointer">{banner.isActive ? 'Hide' : 'Show'}</button>
                        <button onClick={() => openBannerEdit(banner)} className="p-1.5 text-gray-400 hover:text-gold cursor-pointer"><FiEdit2 size={14} /></button>
                        <button onClick={() => deleteBanner(banner.id)} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl flex gap-3">
            <input type="text" value={announcementText} onChange={e => setAnnouncementText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAnnouncement()}
              placeholder="Type new announcement text..." className="flex-1 px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
            <button onClick={addAnnouncement} className="px-4 py-2 bg-gold text-white text-xs font-bold uppercase rounded-lg hover:bg-black transition-colors cursor-pointer"><FiPlus /></button>
          </div>
          <div className="space-y-2">
            {announcements.map(ann => (
              <div key={ann.id} className={`bg-[var(--card-bg)] border rounded-xl p-4 flex items-center gap-3 ${ann.isActive ? 'border-[var(--border-color)]' : 'border-dashed border-gray-300 opacity-60'}`}>
                <FiBell size={14} className={ann.isActive ? 'text-gold' : 'text-gray-400'} />
                <p className="flex-1 text-sm">{ann.text}</p>
                <button onClick={() => toggleAnnouncement(ann.id)} className="text-xs font-bold text-gray-500 hover:text-gold uppercase px-2 cursor-pointer">{ann.isActive ? 'Hide' : 'Show'}</button>
                <button onClick={() => deleteAnnouncement(ann.id)} className="text-gray-400 hover:text-red-500 cursor-pointer"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flash Sales Placeholder */}
      {activeTab === 'flash' && (
        <div className="bg-[var(--card-bg)] border border-dashed border-gold/30 p-12 rounded-xl text-center space-y-2">
          <FiZap size={32} className="text-gold mx-auto" />
          <p className="font-bold uppercase tracking-wider">Flash Sale Campaigns</p>
          <p className="text-sm text-gray-500">Configure timed flash sales with automatic activation and deactivation.</p>
          <p className="text-xs text-gray-400">Coming in next update — architecture is ready.</p>
        </div>
      )}

      {/* Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h3 className="font-bold uppercase tracking-widest text-sm">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={saveBanner} className="p-6 space-y-4">
              {[
                { label: 'Title', key: 'title', placeholder: 'e.g. Summer Collection' },
                { label: 'Subtitle', key: 'subtitle', placeholder: 'e.g. Up to 40% off' },
                { label: 'Image URL', key: 'imageUrl', placeholder: 'https://...' },
                { label: 'Link', key: 'link', placeholder: '/shop?tag=summer' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{f.label}</label>
                  <input type="text" value={bannerForm[f.key]} onChange={e => setBannerForm(prev => ({...prev, [f.key]: e.target.value}))} placeholder={f.placeholder} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Display Order</label>
                  <input type="number" min="1" value={bannerForm.order} onChange={e => setBannerForm(prev => ({...prev, order: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm(prev => ({...prev, isActive: e.target.checked}))} className="w-4 h-4 accent-gold" />
                    Active immediately
                  </label>
                </div>
              </div>
              {bannerForm.imageUrl && <img src={bannerForm.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-[var(--border-color)]" onError={() => {}} />}
              <button type="submit" className="w-full py-3 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <FiSave /> {editingBanner ? 'Save Changes' : 'Create Banner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingManager;
