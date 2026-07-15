import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';

// Subcomponents
import DashboardView from '../components/admin/DashboardView';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import OrderManager from '../components/admin/OrderManager';
import CustomerManager from '../components/admin/CustomerManager';
import ReportsManager from '../components/admin/ReportsManager';
import RecommendationManager from '../components/admin/RecommendationManager';
import CustomOrderManager from '../components/admin/CustomOrderManager';
import MembershipManager from '../components/admin/MembershipManager';
import SettingsManager from '../components/admin/SettingsManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductManager />;
      case 'categories':
        return <CategoryManager />;
      case 'orders':
        return <OrderManager />;
      case 'customers':
        return <CustomerManager />;
      case 'reports':
        return <ReportsManager />;
      case 'recommendations':
        return <RecommendationManager />;
      case 'customizations':
        return <CustomOrderManager />;
      case 'memberships':
        return <MembershipManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="w-full">
        {renderActiveView()}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
