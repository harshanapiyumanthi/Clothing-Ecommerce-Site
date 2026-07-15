import { useState } from 'react';
import { FiStar, FiUsers, FiDollarSign, FiAward } from 'react-icons/fi';

const MembershipManager = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest">Membership & Loyalty</h2>
          <p className="text-sm text-gray-500 mt-1">Manage membership tiers, reward rules, and view customer loyalty analytics.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[var(--border-color)]">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'analytics' ? 'border-b-2 border-gold text-gold' : 'text-gray-500 hover:text-[var(--text-color)]'}`}
        >
          Analytics
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'plans' ? 'border-b-2 border-gold text-gold' : 'text-gray-500 hover:text-[var(--text-color)]'}`}
        >
          Membership Plans
        </button>
        <button 
          onClick={() => setActiveTab('rewards')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'rewards' ? 'border-b-2 border-gold text-gold' : 'text-gray-500 hover:text-[var(--text-color)]'}`}
        >
          Reward Rules
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <FiUsers size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Members</p>
                <p className="text-2xl font-bold">12,450</p>
              </div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/20 text-gold rounded-full flex items-center justify-center shrink-0">
                <FiStar size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Premium Members</p>
                <p className="text-2xl font-bold">3,240</p>
              </div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <FiDollarSign size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Membership Rev</p>
                <p className="text-2xl font-bold">$64,800</p>
              </div>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                <FiAward size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Points Redeemed</p>
                <p className="text-2xl font-bold">1.2M</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl text-center py-12 text-gray-500 text-sm">
            Interactive chart for membership growth will be displayed here.
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl text-center py-12 text-gray-500 text-sm">
          UI to edit Premium and VIP pricing, features, and billing cycles.
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl text-center py-12 text-gray-500 text-sm">
          UI to configure points earned per dollar, birthday bonuses, and redemption values.
        </div>
      )}

    </div>
  );
};

export default MembershipManager;
