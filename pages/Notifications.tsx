import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, Mail, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface Notification {
  id: string;
  type: 'email' | 'system' | 'merchant' | 'payment';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon: 'mail' | 'bell' | 'success' | 'error' | 'clock';
}

export const Notifications: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = () => {
    if (!user) return;

    const stored = localStorage.getItem(`notifications_${user.id}`);
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  };

  const markAsRead = (id: string) => {
    if (!user) return;

    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    if (!user) return;

    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
    toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
  };

  const clearAll = () => {
    if (!user) return;

    setNotifications([]);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]));
    toast.success(language === 'ar' ? 'تم حذف جميع الإشعارات' : 'All notifications cleared');
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'mail': return <Mail className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'clock': return <Clock className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' 
                ? `لديك ${unreadCount} إشعار غير مقروء` 
                : `You have ${unreadCount} unread notifications`}
            </p>
          </div>

          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'حذف الكل' : 'Clear All'}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 glass-effect text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'ar' ? 'لا توجد إشعارات' : 'No Notifications'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'سنرسل لك إشعارات عن التحديثات المهمة' 
                : "We'll notify you about important updates"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 glass-effect cursor-pointer transition-all hover:shadow-lg ${
                    !notification.read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      notification.icon === 'success' ? 'bg-green-500/20 text-green-500' :
                      notification.icon === 'error' ? 'bg-red-500/20 text-red-500' :
                      notification.icon === 'mail' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-purple-500/20 text-purple-500'
                    }`}>
                      {getIcon(notification.icon)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString(
                            language === 'ar' ? 'ar-SA' : 'en-US'
                          )}
                        </span>
                        {!notification.read && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                            {language === 'ar' ? 'جديد' : 'New'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const addNotification = (
  userId: string, 
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
) => {
  const notifications = JSON.parse(
    localStorage.getItem(`notifications_${userId}`) || '[]'
  );

  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    read: false
  };

  notifications.unshift(newNotification);
  
  if (notifications.length > 50) {
    notifications.splice(50);
  }

  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));

  return newNotification;
};
