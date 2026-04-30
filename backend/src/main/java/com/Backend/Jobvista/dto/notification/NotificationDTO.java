package com.Backend.Jobvista.dto.notification;

import com.Backend.Jobvista.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime timestamp;
}
