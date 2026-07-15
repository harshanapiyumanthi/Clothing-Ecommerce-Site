import { useState } from 'react';
import { FiStar, FiUsers, FiDollarSign, FiAward, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const defaultPlans = [
  {
    id: '1', name: 'Free', price: 0, duration: 'Forever', rewardMultiplier: 1, color: '#6b7280',
    benefits: ['Browse & Shop', 'Track Orders', 'Wishlist', 'Outfit Recommendations'],
    isActive: true
  },
  {
    id: '2', name: 'Premium', price: 20, duration: '1 Year', rewardMultiplier: 2, color: '#D4AF37',
    benefits: ['All Free Features', 'Dream Dress Studio Access', '2x Reward Points', 'Early Access to New Arrivals', 'Member-only Coupons', 'Priority Customer Support', 'Free Shipping on All Orders'],
    isActive: true
  },
  {
    id: '3', name: 'VIP', price: 50, duration: '1 Year', rewardMultiplier: 3, color: '#7c3aed',
    benefits: ['All Premium Features', '3x Reward Points', 'Dedicated Fashion Consultant', 'Exclusive VIP Collections', 'Birthday Gift Package', 'First Access to Sales', 'Personal Shopping Service'],
    isActive: true
  },
];

const defaultRules = {
  pointsPerDollar: 1,
  birthdayBonus: 200,
  redemptionRate: 100, // points = $1
  signupBonus: 50,
};

const MembershipManager = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [plans, setPlans] = useState(defaultPlans);
  const [rules, setRules] = useState(defaultRules);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', price: 0, duration: '1 Year', rewardMultiplier: 1, color: '#D4AF37', benefits: [''], isActive: true });

  const openCreatePlan = () => { setEditingPlan(null); setPlanForm({ name: '', price: 0, duration: '1 Year', rewardMultiplier: 1, color: '#D4AF37', benefits: [''], isActive: true }); setShowPlanModal(true); };
  const openEditPlan = (plan) => { setEditingPlan(plan); setPlanForm({ name: plan.name, price: plan.price, duration: plan.duration, rewardMultiplier: plan.rewardMultiplier, color: plan.color, benefits: [...plan.benefits], isActive: plan.isActive }); setShowPlanModal(true); };

  const savePlan = (e) => {
    e.preventDefault();
    const cleanBenefits = planForm.benefits.filter(b => b.trim());
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planForm, benefits: cleanBenefits } : p));
      toast.success('Plan updated!');
    } else {
      setPlans(prev => [...prev, { id: Date.now().toString(), ...planForm, benefits: cleanBenefits }]);
      toast.success('Plan created!');
    }
    setShowPlanModal(false);
  };

  const deletePlan = (id) => {
    if (!window.confirm('Delete this membership plan?')) return;
    setPlans(prev => prev.filter(p => p.id !== id));
    toast.success('Plan deleted');
  };

  const addBenefit = () => setPlanForm(f => ({ ...f, benefits: [...f.benefits, ''] }));
  const updateBenefit = (i, val) => setPlanForm(f => { const b = [...f.benefits]; b[i] = val; return { ...f, benefits: b }; });
  const removeBenefit = (i) => setPlanForm(f => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }));

  const saveRules = () => { toast.success('Reward rules saved!'); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-widest">Membership & Loyalty</h2>
        <p className="text-sm text-gray-500 mt-1">Manage membership tiers, reward rules, and loyalty analytics.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl w-fit">
        {[['analytics', 'Analytics'], ['plans', 'Membership Plans'], ['rewards', 'Reward Rules']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === id ? 'bg-gold text-white shadow-sm' : 'text-gray-500 hover:text-[var(--text-color)]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', value: '12,450', icon: <FiUsers size={18} />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
              { label: 'Premium Members', value: '3,240', icon: <FiStar size={18} />, color: 'bg-gold/20 text-gold' },
              { label: 'Membership Revenue', value: '$64,800', icon: <FiDollarSign size={18} />, color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
              { label: 'Points Redeemed', value: '1.2M', icon: <FiAward size={18} />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
            ].map((s, i) => (
              <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl flex items-center gap-4">
                <div className={`w-11 h-11 ${s.color} rounded-full flex items-center justify-center shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl">
            <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Membership Distribution</h4>
            <div className="flex items-center gap-4 mb-4">
              {[{ label: 'Free (70%)', width: '70%', color: 'bg-gray-300' }, { label: 'Premium (26%)', width: '26%', color: 'bg-gold' }, { label: 'VIP (4%)', width: '4%', color: 'bg-purple-500' }].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs"><span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />{t.label}</div>
              ))}
            </div>
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
              <div className="bg-gray-300 dark:bg-gray-600 h-full rounded-l-full" style={{ width: '70%' }} />
              <div className="bg-gold h-full" style={{ width: '26%' }} />
              <div className="bg-purple-500 h-full rounded-r-full" style={{ width: '4%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openCreatePlan} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors cursor-pointer">
              <FiPlus /> Create New Plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-[var(--card-bg)] border-2 rounded-xl overflow-hidden" style={{ borderColor: plan.color + '40' }}>
                <div className="h-1.5" style={{ backgroundColor: plan.color }} />
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider" style={{ color: plan.color }}>{plan.name}</h4>
                      <p className="text-2xl font-bold mt-1">{plan.price === 0 ? 'Free' : `$${plan.price}`}<span className="text-xs text-gray-400 font-normal">/{plan.duration}</span></p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditPlan(plan)} className="p-1.5 text-gray-400 hover:text-gold cursor-pointer"><FiEdit2 size={14} /></button>
                      {plan.name !== 'Free' && <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"><FiTrash2 size={14} /></button>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{plan.rewardMultiplier}x Reward Multiplier</p>
                    <ul className="space-y-1.5">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <FiCheck size={11} style={{ color: plan.color }} className="shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward Rules Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl space-y-5">
            <h4 className="font-bold uppercase tracking-wider text-sm">Points Earning Rules</h4>
            {[
              { label: 'Points Earned Per $1 Spent', key: 'pointsPerDollar', min: 1 },
              { label: 'Sign-up Bonus Points', key: 'signupBonus', min: 0 },
              { label: 'Birthday Bonus Points', key: 'birthdayBonus', min: 0 },
              { label: 'Points Per $1 Redemption Value', key: 'redemptionRate', min: 1 },
            ].map(r => (
              <div key={r.key} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium flex-1">{r.label}</label>
                <input type="number" min={r.min} value={rules[r.key]} onChange={e => setRules(prev => ({ ...prev, [r.key]: Number(e.target.value) }))}
                  className="w-24 px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans text-center font-bold" />
              </div>
            ))}
          </div>
          <button onClick={saveRules} className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors cursor-pointer shadow-md shadow-gold/25">
            <FiSave /> Save Reward Rules
          </button>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-color)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] sticky top-0 bg-[var(--card-bg)] z-10">
              <h3 className="font-bold uppercase tracking-widest text-sm">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={savePlan} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan Name</label>
                  <input type="text" value={planForm.name} onChange={e => setPlanForm(f => ({...f, name: e.target.value}))} required className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Price ($)</label>
                  <input type="number" min="0" value={planForm.price} onChange={e => setPlanForm(f => ({...f, price: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Duration</label>
                  <select value={planForm.duration} onChange={e => setPlanForm(f => ({...f, duration: e.target.value}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-lg outline-none focus:border-gold text-sm">
                    <option>Forever</option><option>1 Month</option><option>3 Months</option><option>6 Months</option><option>1 Year</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Reward Multiplier</label>
                  <input type="number" min="1" value={planForm.rewardMultiplier} onChange={e => setPlanForm(f => ({...f, rewardMultiplier: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={planForm.color} onChange={e => setPlanForm(f => ({...f, color: e.target.value}))} className="w-10 h-10 rounded cursor-pointer bg-transparent" />
                  <input type="text" value={planForm.color} onChange={e => setPlanForm(f => ({...f, color: e.target.value}))} className="flex-1 px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Benefits</label>
                {planForm.benefits.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={b} onChange={e => updateBenefit(i, e.target.value)} placeholder={`Benefit ${i + 1}`} className="flex-1 px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
                    <button type="button" onClick={() => removeBenefit(i)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><FiX size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={addBenefit} className="flex items-center gap-1 text-xs text-gold hover:text-gold/70 cursor-pointer font-bold">
                  <FiPlus size={12} /> Add Benefit
                </button>
              </div>
              <button type="submit" className="w-full py-3 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <FiSave /> {editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManager;
