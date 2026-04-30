package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.notification.NotificationDTO;
import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getUserNotifications(String email);
    void markAsRead(Long notificationId);
    void createNotification(String email, String message, String type);
    long getUnreadCount(String email);
}
