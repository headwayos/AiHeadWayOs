import React from 'react';

const NotificationCenter = ({ notifications }) => {
  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 shadow-clean animate-slide-down ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;