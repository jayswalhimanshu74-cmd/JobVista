package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.Job.ExternalJobDTO;
import com.Backend.Jobvista.external.adzuna.model.AdzunaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public interface AdzunaService {

        void syncJobs(String keyword);

}
