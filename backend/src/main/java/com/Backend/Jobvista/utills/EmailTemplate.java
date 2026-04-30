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
        };
    }
}
