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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
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

            // --- STRICT CHECK ---
            // If ID is missing, return error instead of creating a new one.
            if (jobId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job ID is missing. Please upload a Job Description first."));
            }

            List<String> skills = (List<String>) payload.get("skills");
            if (skills == null || skills.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No skills provided"));
            }

            jobPostingService.saveRequiredSkills(jobId, skills);
            
            // Return JSON Object
            return ResponseEntity.ok(Map.of(
                "message", "Skills saved successfully", 
                "jobId", jobId
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save requirements: " + e.getMessage()));
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

    private static final Logger logger = LoggerFactory.getLogger(JobPostingController.class);

    @PostMapping("/upload")
public ResponseEntity<?> uploadJobPosting(
        @RequestParam("file") MultipartFile file,
        @RequestParam("userId") Long userId) {

    logger.info("=== JD UPLOAD STARTED ===");

    try {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ CORRECT UPLOAD DIRECTORY (project-root/uploads/job_descriptions)
        String uploadDir = System.getProperty("user.dir")
                + File.separator + "uploads"
                + File.separator + "job_descriptions";

        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            logger.info("Upload directory created: {} -> {}", uploadFolder.getAbsolutePath(), created);
            if (!created) {
                throw new IOException("Could not create upload directory");
            }
        }

        // ✅ Safe unique filename
        String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // ✅ CORRECT FILE PATH
        File dest = new File(uploadFolder, uniqueName);
        logger.info("Saving file at: {}", dest.getAbsolutePath());

        // ✅ Save file
        file.transferTo(dest);

        // ✅ Parse SAME FILE
        JobPosting extractedData = jobDescriptionParsingService.parseJobDescription(dest);

        JobPosting jp = new JobPosting();
        jp.setTitle(extractedData.getTitle() != null ? extractedData.getTitle() : file.getOriginalFilename());
        jp.setDepartment(extractedData.getDepartment());
        jp.setDescription(extractedData.getDescription());
        jp.setMinExperienceYears(extractedData.getMinExperienceYears());
        jp.setEducationLevel(extractedData.getEducationLevel());

        // ✅ Save path for reuse
        jp.setFileName(file.getOriginalFilename());
        jp.setFilePath(dest.getAbsolutePath());
        jp.setFileType(file.getContentType());

        jp.setCreatedBy(user);
        jp.setCreatedAt(LocalDateTime.now());

        JobPosting savedJob = jobPostingRepository.save(jp);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedJob.getId());
        response.put("message", "Upload successful");

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        logger.error("JD UPLOAD FAILED", e);
        return ResponseEntity.status(500).body(e.getMessage());
    }
}


}

