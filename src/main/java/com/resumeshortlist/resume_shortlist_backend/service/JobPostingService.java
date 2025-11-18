package com.resumeshortlist.resume_shortlist_backend.service;

import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import com.resumeshortlist.resume_shortlist_backend.entity.User;
import com.resumeshortlist.resume_shortlist_backend.repository.JobPostingRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobPostingService {
    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private UserRepository userRepository;

    public JobPosting createJobPosting(JobPosting jobPosting, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        jobPosting.setCreatedBy(user);
        return jobPostingRepository.save(jobPosting);
    }
    public List<JobPosting> getAllJobPostings() {
        return jobPostingRepository.findAll();
    }


    public JobPosting getJobById(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Posting not found with id: " + id));
    }

    // DELETE job posting by ID
    public String deleteJobById(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete. Job Posting not found with id: " + id);
        }
        jobPostingRepository.deleteById(id);
        return "Job Posting deleted successfully.";
    }

}

