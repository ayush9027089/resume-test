package com.resumeshortlist.resume_shortlist_backend.controller;

import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import com.resumeshortlist.resume_shortlist_backend.service.JobPostingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-postings")
public class JobPostingController {

    @Autowired
    private JobPostingService jobPostingService;

    @PostMapping("/create")
    public JobPosting createJobPosting(
            @RequestBody JobPosting jobPosting,
            @RequestParam Long userId
    ) {
        return jobPostingService.createJobPosting(jobPosting, userId);
    }
    @GetMapping("/all")
    public List<JobPosting> getAllJobPostings() {
        return jobPostingService.getAllJobPostings();
    }

    // 🎯 API #5: Get single job by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.getJobById(id));
    }

    // 🎯 API #6: Delete job by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.deleteJobById(id));
    }



}

