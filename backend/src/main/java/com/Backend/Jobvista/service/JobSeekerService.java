package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.jobSeeker.JobSeekerRequestDTO;
import com.Backend.Jobvista.dto.jobSeeker.JobSeekersResponseDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public interface JobSeekerService {

    JobSeekersResponseDTO createJobSeeker( String email ,JobSeekerRequestDTO dto);

    String uploadResume(String email, MultipartFile file);

    ResponseEntity<Resource> downloadResume(String email);

     JobSeekersResponseDTO getJobSeekerByEmail( String email);

     JobSeekersResponseDTO updateJobSeeker( String email, JobSeekerRequestDTO dto);

    void deleteJobSeeker(String email);

}
