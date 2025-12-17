package com.resumeshortlist.resume_shortlist_backend.service;

import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import com.resumeshortlist.resume_shortlist_backend.entity.RequiredSkill;
import com.resumeshortlist.resume_shortlist_backend.entity.User;
import com.resumeshortlist.resume_shortlist_backend.repository.JobPostingRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.RequiredSkillRepository;
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

    @Autowired
    private RequiredSkillRepository requiredSkillRepository;

    public JobPosting createJobPosting(JobPosting jobPosting, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        jobPosting.setCreatedBy(user);
        return jobPostingRepository.save(jobPosting);
    }

    /**
     * Convenience method to create a basic job posting and attach required skills.
     * This is used by the recruiter "Find Your Perfect Match" flow.
     */
    public JobPosting createJobPostingWithSkills(String title, Long userId, java.util.List<String> skills) {
        JobPosting jobPosting = new JobPosting();
        jobPosting.setTitle(title);
        jobPosting.setDescription("Created from recruiter domain/skills selection");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        jobPosting.setCreatedBy(user);

        JobPosting savedJob = jobPostingRepository.save(jobPosting);

        if (skills != null) {
            for (String skillName : skills) {
                if (skillName == null || skillName.isBlank()) continue;
                RequiredSkill rs = new RequiredSkill();
                rs.setJobPosting(savedJob);
                rs.setSkillName(skillName.trim());
                rs.setCategory("TECHNICAL");
                rs.setIsRequired(true);
                rs.setWeight(10); // default weight, can be tuned later
                requiredSkillRepository.save(rs);
            }
        }

        return savedJob;
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

