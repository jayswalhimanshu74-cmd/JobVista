package com.Backend.Jobvista.event;


import com.Backend.Jobvista.entity.EmailType;
import com.Backend.Jobvista.utills.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@RequiredArgsConstructor
@Component
public class ApplicationEventListener {

    private final EmailService emailService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final com.Backend.Jobvista.service.NotificationService notificationService;

    @EventListener
    public void handleApplicationEvent(ApplicationEvent event){

        if (event.getEventType() == ApplicationEvent.EventType.JOB_CREATED) {
            // Broadcast new job to everyone
            messagingTemplate.convertAndSend("/topic/jobs", event.getPayload());
            return;
        }

        // For application updates, send email and websocket notification
        if (event.getEmail() != null) {
            String message = String.format("Application for '%s' updated to: %s", event.getJobTitle(), event.getStatus());
            
            // Save to DB
            notificationService.createNotification(event.getEmail(), message, "APPLICATION_UPDATE");
            
            // Send WebSocket notification
            messagingTemplate.convertAndSend("/topic/notifications/" + event.getEmail(), message);
            
            // Send Application status update
            messagingTemplate.convertAndSend("/topic/applications/" + event.getEmail(), event);

            // Send Email
            emailService.sendMail(
                    event.getEmail(),
                    EmailType.APPLICATION_STATUS_UPDATED,
                    Map.of(
                            "name", event.getName(),
                            "jobTitle", event.getJobTitle(),
                            "status", event.getStatus()
                    )
            );
        }
    }
}
