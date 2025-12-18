package com.resumeshortlist.resume_shortlist_backend.controller;

import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import com.resumeshortlist.resume_shortlist_backend.entity.User;
import com.resumeshortlist.resume_shortlist_backend.repository.JobPostingRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.UserRepository;
import com.resumeshortlist.resume_shortlist_backend.service.JobDescriptionParsingService;
import com.resumeshortlist.resume_shortlist_backend.service.JobPostingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-postings")
public class JobPostingController {

    @Autowired
    private JobPostingService jobPostingService;
    @Autowired
    private JobPostingRepository jobPostingRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobDescriptionParsingService jobDescriptionParsingService;

    
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

    //Save required-skills from ui
    @PostMapping("/save-requirements")
    public ResponseEntity<?> saveRequirements(@RequestBody Map<String, Object> payload) {
        try {
            Long jobId = null;
            if (payload.get("jobId") != null) {
                jobId = Long.valueOf(payload.get("jobId").toString());
            }

            List<String> skills = (List<String>) payload.get("skills");
            String jobDomain = (String) payload.get("jobDomain");

            if (jobId == null) {
                if (payload.get("userId") == null) {
                    return ResponseEntity.badRequest().body("User ID is required when creating a new job from scratch.");
                }
                Long userId = Long.valueOf(payload.get("userId").toString());

                // Create a placeholder job using the Domain as the Title
                JobPosting newJob = jobPostingService.createJobPostingWithSkills(jobDomain, userId, null);
                jobId = newJob.getId();
            }

            if (skills == null || skills.isEmpty()) {
                return ResponseEntity.badRequest().body("No skills provided");
            }

            jobPostingService.saveRequiredSkills(jobId, skills);
            return ResponseEntity.ok("Skills saved successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to save requirements: " + e.getMessage());
        }
    }


    // API: Create a job posting + required skills from recruiter domain/skills selection
    @PostMapping("/domain-skills")
    public ResponseEntity<?> createJobFromDomainAndSkills(
            @RequestParam("userId") Long userId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            String title = (String) payload.getOrDefault("jobDomain", "Job");
            Object rawSkills = payload.get("skills");

            List<String> skills = new ArrayList<>();
            if (rawSkills instanceof List<?>) {
                for (Object o : (List<?>) rawSkills) {
                    if (o != null) {
                        skills.add(o.toString());
                    }
                }
            }

            JobPosting job = jobPostingService.createJobPostingWithSkills(title, userId, skills);

            return ResponseEntity.ok(Map.of(
                    "jobId", job.getId(),
                    "title", job.getTitle(),
                    "skillCount", skills.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create job with skills: " + e.getMessage());
        }
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

    @PostMapping("/upload")
    public ResponseEntity<?> uploadJobPostings(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("userId") Long userId) {
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<JobPosting> savedPostings = new ArrayList<>();
            String uploadDir = "uploads/job_descriptions/";
            File folder = new File(uploadDir);
            if (!folder.exists()) folder.mkdirs();

            for (MultipartFile file : files) {
                // 1. Save File Physically
                String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File dest = new File(uploadDir + uniqueName);
                try (FileOutputStream fos = new FileOutputStream(dest)) {
                    fos.write(file.getBytes());
                }

                // 2. Parse File content using Gemini (Auto-Extraction)
                JobPosting extractedData = jobDescriptionParsingService.parseJobDescription(dest);

                // 3. Create Entity & Merge Data
                JobPosting jp = new JobPosting();
                
                // Use Extracted data if available, else fallback to filename
                jp.setTitle(extractedData.getTitle() != null ? extractedData.getTitle() : file.getOriginalFilename());
                jp.setDepartment(extractedData.getDepartment());
                jp.setDescription(extractedData.getDescription() != null ? extractedData.getDescription() : "Uploaded via File");
                jp.setMinExperienceYears(extractedData.getMinExperienceYears());
                jp.setEducationLevel(extractedData.getEducationLevel());

                // Metadata
                jp.setFileName(file.getOriginalFilename());
                jp.setFilePath(dest.getAbsolutePath());
                jp.setFileType(file.getContentType());
                jp.setCreatedBy(user);
                jp.setCreatedAt(LocalDateTime.now());
                
                // 4. Save to DB
                savedPostings.add(jobPostingRepository.save(jp));
            }

            return ResponseEntity.ok(savedPostings);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("JD Upload & Analysis Failed: " + e.getMessage());
        }
    }

}

