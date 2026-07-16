import React, { useState, useEffect } from 'react';
import { FiUsers, FiMessageSquare, FiMail, FiCheck, FiX, FiSend, FiStar, FiFilter, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminApi } from '../../utils/adminApi';

const CrmManager = () => {
  const [activeTab, setActiveTab] = useState('segments');
  const [loading, setLoading] = useState(true);
  
  // CRM States
  const [segments, setSegments] = useState({ vip: 0, loyal: 0, new: 0, inactive: 0 });
  const [tickets, setTickets] = useState([]);
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Welcome Series', type: 'Email', status: 'Active' },
    { id: '2', name: 'Abandoned Cart', type: 'Email', status: 'Active' },
    { id: '3', name: 'Birthday Gift', type: 'Email', status: 'Active' }
  ]);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchCrmData();
  }, []);

  const fetchCrmData = async () => {
    setLoading(true);
    try {
      const segRes = await adminApi.getCRMDashboard();
      if (segRes.success) setSegments(segRes.segments);
      
      const tickRes = await adminApi.getSupportTickets();
      if (tickRes.success) setTickets(tickRes.tickets || []);
      else setTickets([]);
    } catch (err) {
      toast.error('Failed to load CRM data');
    }
    setLoading(false);
  };

  const handleTicketReply = async (ticketId) => {
    if (!replyMessage.trim()) return toast.warning('Reply cannot be empty.');
    try {
      const res = await adminApi.updateSupportTicket(ticketId, 'Closed', replyMessage);
      if (res.success) {
        toast.success('Ticket closed and replied successfully!');
        setReplyMessage('');
        fetchCrmData();
      } else {
        toast.error(res.message || 'Error updating ticket');
      }
    } catch(err) {
      toast.error('Failed to reply to ticket.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading CRM Dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--text-color)]">CRM & Support</h2>
          <p className="text-xs text-gray-500 mt-1">Manage relationships, marketing segments, and customer queries.</p>
        </div>
      </div>

      {/* CRM Navigation */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto custom-scrollbar">
        <button onClick={() => setActiveTab('segments')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${activeTab === 'segments' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-[var(--text-color)]'}`}>
          <FiUsers className="inline mr-2" /> Segments
        </button>
        <button onClick={() => setActiveTab('tickets')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-[var(--text-color)]'}`}>
          <FiMessageSquare className="inline mr-2" /> Support Tickets
        </button>
        <button onClick={() => setActiveTab('templates')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${activeTab === 'templates' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-[var(--text-color)]'}`}>
          <FiMail className="inline mr-2" /> Templates
        </button>
      </div>

      {/* Segments View */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--card-bg)] border border-gold/30 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FiStar size={64} className="text-gold" /></div>
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">VIP Customers</h3>
              <p className="text-3xl font-bold text-gold mt-2 font-sans">{segments.vip}</p>
              <p className="text-[10px] text-gray-400 mt-2 font-semibold">Premium & Gold Tier</p>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Loyal Active</h3>
              <p className="text-3xl font-bold text-[var(--text-color)] mt-2 font-sans">{segments.loyal}</p>
              <p className="text-[10px] text-gray-400 mt-2 font-semibold">Purchased in last 3 months</p>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">New Customers</h3>
              <p className="text-3xl font-bold text-[var(--text-color)] mt-2 font-sans">{segments.new}</p>
              <p className="text-[10px] text-gray-400 mt-2 font-semibold">Joined within 30 days</p>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
              <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Inactive</h3>
              <p className="text-3xl font-bold text-[var(--text-color)] mt-2 font-sans">{segments.inactive}</p>
              <p className="text-[10px] text-orange-500 mt-2 font-semibold">Risk of churn (6+ months)</p>
            </div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Segment Actions</h3>
            <p className="text-xs text-gray-500 mb-6">Select a segment to send a targeted marketing campaign.</p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gold transition-colors">Campaign to VIPs</button>
              <button className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-[var(--text-color)] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gold hover:text-white transition-colors">Re-engagement Email (Inactive)</button>
            </div>
          </div>
        </div>
      )}

      {/* Support Tickets View */}
      {activeTab === 'tickets' && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-xs uppercase tracking-widest">Active Tickets</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
              <FiFilter /> Filter Status
            </div>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {tickets.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs">
                <FiMessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                No support tickets found. Inbox zero!
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          ticket.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          ticket.status === 'Closed' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>{ticket.status}</span>
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{ticket.category}</span>
                        <span className="text-[9px] text-gray-400 font-mono">ID: {ticket._id}</span>
                      </div>
                      <h4 className="font-bold text-sm">{ticket.subject}</h4>
                      <p className="text-xs text-gray-500">User: {ticket.user?.email}</p>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded border border-[var(--border-color)] text-xs mt-4 max-h-40 overflow-y-auto">
                        {ticket.messages.map((msg, i) => (
                          <div key={i} className={`mb-3 last:mb-0 ${msg.sender === 'admin' ? 'border-l-2 border-gold pl-3' : ''}`}>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{msg.sender === 'user' ? 'Customer' : 'Support Team'} - {new Date(msg.timestamp).toLocaleDateString()}</p>
                            <p className="text-[var(--text-color)]">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ticket.status !== 'Closed' && (
                      <div className="md:w-72 flex-shrink-0 flex flex-col gap-3">
                        <textarea 
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type response to customer..." 
                          className="w-full h-32 px-4 py-2 border border-[var(--border-color)] bg-transparent rounded text-xs outline-none focus:border-gold resize-none"
                        ></textarea>
                        <button onClick={() => handleTicketReply(ticket._id)} className="w-full py-2.5 bg-gold hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2">
                          <FiSend /> Send & Close Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Templates View */}
      {activeTab === 'templates' && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm p-6">
           <h3 className="font-bold text-sm uppercase tracking-widest mb-6">Marketing & Email Templates</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {templates.map(tpl => (
               <div key={tpl.id} className="border border-[var(--border-color)] p-5 rounded-xl hover:border-gold transition-colors">
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold"><FiMail size={16} /></div>
                   <span className="text-[9px] font-bold px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full uppercase tracking-widest">{tpl.status}</span>
                 </div>
                 <h4 className="font-bold text-xs">{tpl.name}</h4>
                 <p className="text-[10px] text-gray-500 mt-1">Automated {tpl.type} Sequence</p>
                 <button className="mt-4 w-full py-2 border border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white rounded transition-colors">Edit Content</button>
               </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
};

export default CrmManager;
