
import React, { useEffect } from 'react';
import type { Notification } from '../types';
import { NotificationType } from '../types';

interface NotificationProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

const NotificationComponent: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const baseClasses = 'fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center z-50';
  const typeClasses = {
    [NotificationType.SUCCESS]: 'bg-green-500',
    [NotificationType.ERROR]: 'bg-red-500',
  };

  const Icon = () => {
    if (notification.type === NotificationType.SUCCESS) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`}>
      <Icon />
      <span>{notification.message}</span>
      <button onClick={() => onDismiss(notification.id)} className="ml-auto text-xl font-bold">&times;</button>
    </div>
  );
};

export default NotificationComponent;
