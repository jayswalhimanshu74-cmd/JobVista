package com.Backend.Jobvista.service;

import org.springframework.stereotype.Service;

@Service
public interface AdzunaService {

    void syncJobs(String keyword);

    int syncJobsSync(String keyword);

    boolean isDailyCapReached();

    int getDailyCallCount();

}
