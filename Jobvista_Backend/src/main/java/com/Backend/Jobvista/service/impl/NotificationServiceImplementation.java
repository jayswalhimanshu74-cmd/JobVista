package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.notification.NotificationDTO;
import com.Backend.Jobvista.entity.Notification;
import com.Backend.Jobvista.entity.NotificationType;
import com.Backend.Jobvista.repository.NotificationRepository;
import com.Backend.Jobvista.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImplementation implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<NotificationDTO> getUserNotifications(String email) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(email)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public void createNotification(String email, String message, String type) {
        Notification notification = Notification.builder()
                .userId(email)
                .message(message)
                .type(NotificationType.valueOf(type))
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserIdAndIsReadFalse(email);
    }

    private NotificationDTO mapToDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .timestamp(n.getTimestamp())
                .build();
    }
}
