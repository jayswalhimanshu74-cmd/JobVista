package com.Backend.Jobvista.utills;

import com.Backend.Jobvista.entity.EmailType;
import org.springframework.stereotype.Service;

import java.util.Map;


@Service
public class EmailTemplate {

    public String getSubject(EmailType type) {
        return switch (type) {
            case USER_REGISTERED -> "Welcome to JobVista 🎉";
            case LOGIN_ALERT -> "Login Alert";
            case APPLICATION_SUBMITTED -> "Application Submitted Successfully";
            case APPLICATION_STATUS_UPDATED -> "Application Status Updated";
            case EMAIL_VERIFICATION -> "Verify your email - JobVista";
        };
    }

    public String getBody(EmailType type, Map<String, String> data) {
        return switch (type) {
            case USER_REGISTERED ->
                    "Hi " + data.get("name") +
                            ",\n\nYour JobVista account has been created successfully.";

            case LOGIN_ALERT ->
                    "You have successfully logged into JobVista.";

            case APPLICATION_SUBMITTED ->
                    "You applied for the position: " + data.get("jobTitle");

            case APPLICATION_STATUS_UPDATED ->
                    "Your application status is now: " + data.get("status");

            case EMAIL_VERIFICATION ->
                    "Hi " + data.get("name") + ",\n\nPlease verify your email address by clicking the link below:\n" +
                            data.get("verificationLink") + "\n\nIf you did not request this, you can ignore this email.";
        };
    }
}
