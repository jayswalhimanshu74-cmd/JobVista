package com.Backend.Jobvista.service;

import com.Backend.Jobvista.entity.Job;
import com.Backend.Jobvista.entity.User;

public interface UserActivityService {
    void trackJobView(User user, Job job);
}
