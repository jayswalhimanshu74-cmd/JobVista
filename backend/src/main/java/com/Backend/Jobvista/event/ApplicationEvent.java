package com.Backend.Jobvista.event;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ApplicationEvent {

    public enum EventType {
        JOB_CREATED, APPLICATION_SUBMITTED, STATUS_CHANGED
    }

    private String email;
    private String name;
    private String jobTitle;
    private String status;
    private EventType eventType;
    private Object payload; // To carry extra data like the job object itself
}
