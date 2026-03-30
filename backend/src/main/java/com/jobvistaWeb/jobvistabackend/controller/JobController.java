package com.jobvistaWeb.jobvistabackend.controller;

import com.jobvistaWeb.jobvistabackend.services.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {


    private JobService jobService;
    JobController(JobService jobService) {
        this.jobService = jobService;
    }


//    @GetMapping
//    public List<Job> getAllJobs() {
//        return jobService.getAllJobs();
//    }
//
//    @PostMapping
//    public Job createJob(@RequestBody Job job) {
//        return jobService.createJob(job);
//    }
}

