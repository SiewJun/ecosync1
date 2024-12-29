import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bell, Check, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        const data = await response.json();
        setUserId(data.user.id);
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notification/noti', {
          credentials: 'include'
        });
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchUserId();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
  
    if (userId) {
      socket.emit('joinRoom', userId);
    }
  
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  
    socket.on('notificationCreated', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  
    socket.on('notificationUpdated', (updatedNotification) => {
      setNotifications(prev => prev.map(n => n.id === updatedNotification.id ? updatedNotification : n));
    });
  
    socket.on('notificationDeleted', (deletedNotificationId) => {
      setNotifications(prev => prev.filter(n => n.id !== deletedNotificationId));
    });
  
    return () => socket.disconnect();
  }, [userId]);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:5000/api/notification/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => fetch(`http://localhost:5000/api/notification/${n.id}/read`, {
            method: 'PUT',
            credentials: 'include'
          }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell 
            size={20} 
            className={cn(
              "transition-colors duration-200",
              unreadCount > 0 ? "text-primary" : "text-muted-foreground"
            )} 
          />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-in fade-in duration-200"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-primar hover:text-primary hover:bg-secondary transition-colors"
            >
              <CheckCheck size={14} className="mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)] min-h-[400px]">
          {notifications.length > 0 ? (
            <div className="py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex flex-col gap-2 px-4 py-4 hover:bg-primary/50 transition-all duration-200",
                    !notification.isRead && "bg-secondary"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow">
                      <h4 className="text-sm font-semibold leading-tight mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-xs mt-2 block">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => markAsRead(notification.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 hover:bg-secondary text-primary"
                      >
                        <Check size={16} className="mr-1" />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <Bell size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1">We&apos;ll notify you when something arrives</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;