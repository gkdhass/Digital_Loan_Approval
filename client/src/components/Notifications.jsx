import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Clock, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../services/api';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications', { params: { limit: 10 } });
      // Safely extract arrays - handle both response structures
      const data = response.data?.data || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(response.data?.unreadCount || response.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prevNotifications =>
        Array.isArray(prevNotifications)
          ? prevNotifications.map(n =>
              n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
            )
          : []
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prevNotifications =>
        Array.isArray(prevNotifications)
          ? prevNotifications.map(n => ({ ...n, isRead: true, readAt: new Date() }))
          : []
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const deletedNotification = Array.isArray(notifications)
        ? notifications.find(n => n._id === id)
        : null;
      setNotifications(prevNotifications =>
        Array.isArray(prevNotifications)
          ? prevNotifications.filter(n => n._id !== id)
          : []
      );
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success dark:text-successDark" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error dark:text-errorDark" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning dark:text-warningDark" />;
      default:
        return <Info className="h-5 w-5 text-accent dark:text-accentDarkMode" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-successBadge border-successBorder dark:bg-successBadgeDark dark:border-successBorderDark';
      case 'error':
        return 'bg-errorBadge border-errorBorder dark:bg-errorBadgeDark dark:border-errorBorderDark';
      case 'warning':
        return 'bg-warningBadge border-warningBorder dark:bg-warningBadgeDark dark:border-warningBorderDark';
      default:
        return 'bg-accent-50 border-accent-200 dark:bg-accent-900/20 dark:border-accent-800';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foregroundSecondary dark:text-foregroundSecondaryDark hover:bg-input dark:hover:bg-cardDark rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-error rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-card dark:bg-cardDark rounded-xl shadow-soft-lg border border-border dark:border-borderDark z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:text-primaryHover font-medium"
                  >
                    Mark all as read
                  </motion.button>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-96">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-foregroundMuted dark:text-foregroundMutedDark mx-auto mb-3" />
                    <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border dark:divide-borderDark">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-input dark:hover:bg-cardDark transition-colors ${
                          !notification.isRead ? 'bg-cyan-50/50 dark:bg-cyan-900/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-foregroundMuted dark:text-foregroundMutedDark mt-2 flex items-center gap-1">
                                  <Clock size={12} />
                                  {notification.createdAt ? formatDate(notification.createdAt) : 'N/A'}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!notification.isRead && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => markAsRead(notification._id)}
                                    className="p-1 text-foregroundMuted dark:text-foregroundMutedDark hover:text-primary dark:hover:text-primaryDark transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check size={14} />
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteNotification(notification._id)}
                                  className="p-1 text-foregroundMuted dark:text-foregroundMutedDark hover:text-error dark:hover:text-errorDark transition-colors"
                                  title="Delete"
                                >
                                  <X size={14} />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-border dark:border-borderDark">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        // Navigate to full notifications page if needed
                      }}
                      className="w-full text-center text-sm text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
