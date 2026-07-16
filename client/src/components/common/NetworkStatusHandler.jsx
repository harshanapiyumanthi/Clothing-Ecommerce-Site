import { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi } from 'react-icons/fi';
import { toast } from 'react-toastify';

const NetworkStatusHandler = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored. You are back online.', {
        icon: <FiWifi />,
        autoClose: 3000,
        position: 'bottom-right'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be unavailable.', {
        icon: <FiWifiOff />,
        autoClose: false,
        position: 'bottom-right'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-red-600/90 text-white backdrop-blur-md border-t border-red-500 py-2 px-4 shadow-lg flex items-center justify-center gap-3 animate-slide-up">
      <FiWifiOff size={18} className="animate-pulse" />
      <span className="text-sm font-bold tracking-wide uppercase">No Internet Connection Detected. Application is running in offline mode.</span>
    </div>
  );
};

export default NetworkStatusHandler;
