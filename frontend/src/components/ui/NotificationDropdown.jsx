import React from 'react';
import { Bell, CheckCircle, Info, AlertCircle, X } from 'lucide-react';
import notificationService from '../../api/notificationService';

const NotificationDropdown = ({ notifications, onMarkAsRead, onClose }) => {
    
    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
            case 'ERROR': return <AlertCircle size={16} className="text-red-500" />;
            case 'JOB_ALERT': return <Bell size={16} className="text-blue-500" />;
            default: return <Info size={16} className="text-gray-500" />;
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            onMarkAsRead(id);
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Notifications</h3>
                <button onClick={onClose} className="close-btn"><X size={18} /></button>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">No new notifications</div>
                ) : (
                    notifications.map((n) => (
                        <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                            <div className="notification-icon">{getIcon(n.type)}</div>
                            <div className="notification-content">
                                <p>{n.message}</p>
                                <span className="timestamp">{new Date(n.timestamp).toLocaleString()}</span>
                            </div>
                            {!n.read && (
                                <button 
                                    className="mark-read-btn" 
                                    onClick={() => handleMarkAsRead(n.id)}
                                    title="Mark as read"
                                >
                                    <CheckCircle size={14} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
