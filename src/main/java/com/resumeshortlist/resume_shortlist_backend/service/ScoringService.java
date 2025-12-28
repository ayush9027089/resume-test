package com.resumeshortlist.resume_shortlist_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.resumeshortlist.resume_shortlist_backend.entity.Candidate;
import com.resumeshortlist.resume_shortlist_backend.entity.CandidateScore;
import com.resumeshortlist.resume_shortlist_backend.entity.Certification;
import com.resumeshortlist.resume_shortlist_backend.entity.Education;
import com.resumeshortlist.resume_shortlist_backend.entity.ExtractedSkill;
import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import com.resumeshortlist.resume_shortlist_backend.entity.Project;
import com.resumeshortlist.resume_shortlist_backend.entity.RequiredSkill;
import com.resumeshortlist.resume_shortlist_backend.entity.WorkExperience;
import com.resumeshortlist.resume_shortlist_backend.exception.ResourceNotFoundException;
import com.resumeshortlist.resume_shortlist_backend.repository.CandidateRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.CandidateScoreRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.CertificationRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.EducationRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.ExtractedSkillRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.JobPostingRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.ProjectRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.RequiredSkillRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.WorkExperienceRepository;
import com.resumeshortlist.resume_shortlist_backend.task.ScoringTask;
@Service
public class ScoringService {

    @Autowired private CandidateRepository candidateRepository;
    @Autowired private JobPostingRepository jobPostingRepository;
    @Autowired private CandidateScoreRepository candidateScoreRepository;

    @Autowired
    private EducationRepository educationRepository;
    @Autowired private ExtractedSkillRepository extractedSkillRepository;
    @Autowired private RequiredSkillRepository requiredSkillRepository;
    @Autowired private WorkExperienceRepository workExperienceRepository;
    @Autowired private CertificationRepository certificationRepository;
    @Autowired private ProjectRepository projectRepository;
    private final ScoringTask scoringTask;

    public ScoringService(ScoringTask scoringTask) {
        this.scoringTask = scoringTask;
    }

    // @Transactional
    // public void triggerScoring(Long jobId) {
    //     List<Candidate> allCandidates = candidateRepository.findAll();

    //     for (Candidate candidate : allCandidates) {
    //         calculateAndSaveScore(candidate.getId(), jobId);
    //     }
    // }

//     @Transactional
// public void triggerScoring(Long jobId, List<Long> newCandidateIds) { // Sirf naye IDs lein
//     for (Long candId : newCandidateIds) {
//         calculateAndSaveScore(candId, jobId);
//     }
// }

// @Transactional
// public void triggerScoring(Long jobId, List<Long> newCandidateIds) {
//     // 1. Pehle purane scores delete karein taaki dashboard sirf naye results dikhaye
//     // Note: Iske liye Repository mein deleteByJobPostingId method hona chahiye
//     candidateScoreRepository.deleteByJobPostingId(jobId);

//     // 2. Sirf naye candidates ko score karein
//     for (Long candId : newCandidateIds) {
//         calculateAndSaveScore(candId, jobId);
//     }
// }

// ScoringService.java ke andar ye wala method rakhein jo List handle kare
@Transactional
public void triggerScoring(Long jobId, List<Long> newCandidateIds) {
    // 1. Check karein ki Job exist karti hai ya nahi
    if (!jobPostingRepository.existsById(jobId)) {
        throw new ResourceNotFoundException("Job ID " + jobId + " nahi mila");
    }

    // 2. Loop chala kar har candidate ko score karein
    for (Long candId : newCandidateIds) {
        // Validation: Candidate check karein
        if (candidateRepository.existsById(candId)) {
            // Aapka purana method call karein jo scoring karta hai
            calculateAndSaveScore(candId, jobId);
        } else {
            // Agar koi ID galat hai toh console mein warning dikhaye, crash na kare
            System.out.println("Warning: Candidate ID " + candId + " system mein nahi hai. Skipping...");
        }
    }
}

    public void calculateAndSaveScore(Long candidateId, Long jobPostingId) {
        // 1. Fetch Entities
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new RuntimeException("Job Posting not found"));

        int totalScore = 0;

        // --- 1️⃣ Education Degree Match (+2) ---
        List<Education> educations = educationRepository.findByCandidateId(candidateId);
        boolean hasDegree = educations.stream()
                .anyMatch(e -> e.getDegree() != null && !e.getDegree().isBlank());
        if (hasDegree) totalScore += 2;

        // --- 2️⃣ Profile Link Check (+1) ---
        boolean hasProfile = (candidate.getLinkedinUrl() != null && !candidate.getLinkedinUrl().isBlank()) ||
                (candidate.getPortfolioUrl() != null && !candidate.getPortfolioUrl().isBlank()) ||
                (candidate.getGithubUrl() != null && !candidate.getGithubUrl().isBlank());
        if (hasProfile) totalScore += 1;

        // --- 3️⃣ Skill Match with Job Posting (+3) ---
        List<ExtractedSkill> candidateSkills = extractedSkillRepository.findByCandidateId(candidateId);
        List<RequiredSkill> requiredSkills = requiredSkillRepository.findByJobPostingId(jobPostingId);

        // Check karein ki candidate ka name null toh nahi
if (candidate.getName() == null || candidate.getName().isEmpty()) {
    System.out.println("Warning: Candidate ID " + candidateId + " has no name!");
}

        // Normalize strings for comparison (lowercase, trimmed)
        Set<String> candSkillNames = candidateSkills.stream()
                .map(s -> s.getSkillName().toLowerCase().trim())
                .collect(Collectors.toSet());

        long matchCount = requiredSkills.stream()
                .filter(rs -> candSkillNames.contains(rs.getSkillName().toLowerCase().trim()))
                .count();

        if (matchCount >= 2) totalScore += 3;

        // --- 4️⃣ Technical + Tools Skill Combination (+3) ---
        boolean hasTech = candidateSkills.stream().anyMatch(s -> "TECHNICAL".equalsIgnoreCase(s.getCategory()));
        boolean hasTool = candidateSkills.stream().anyMatch(s -> "TOOL".equalsIgnoreCase(s.getCategory()));

        if (hasTech && hasTool) totalScore += 3;

        // --- 5️⃣ Work Experience Check (+5) ---
        List<WorkExperience> workExperiences = workExperienceRepository.findByCandidateId(candidateId);
        boolean validExp = workExperiences.stream()
                .anyMatch(w -> w.getJobTitle() != null && !w.getJobTitle().isBlank() &&
                        w.getCompany() != null && !w.getCompany().isBlank());
        if (validExp) totalScore += 5;

        // --- 6️⃣ Certifications Check (+5) ---
        List<Certification> certifications = certificationRepository.findByCandidateId(candidateId);
        boolean hasCert = certifications.stream()
                .anyMatch(c -> c.getName() != null && !c.getName().isBlank());
        if (hasCert) totalScore += 5;

        // --- 7️⃣ Project Validation (+5) ---
        List<Project> projects = projectRepository.findByCandidateId(candidateId);
        if (projects.size() >= 2) totalScore += 5;

        // --- 8️⃣ Education Extra Scoring (Max 6) ---
        int eduExtraScore = 0;
        for (Education edu : educations) {
            int currentEduScore = 0;
            if (edu.getInstitution() != null && !edu.getInstitution().isBlank()) currentEduScore += 2;
            if (edu.getEndYear() != null) currentEduScore += 2;
            if (edu.getGpa() != null) currentEduScore += 1;
            if (edu.getFieldOfStudy() != null && !edu.getFieldOfStudy().isBlank()) currentEduScore += 1;

            eduExtraScore = Math.max(eduExtraScore, currentEduScore); // Take best single education entry
        }
        totalScore += Math.min(eduExtraScore, 6); // Cap at 6

        // --- Determine Status ---
        String status;
        if (totalScore >= 18) {
            status = "SHORTLISTED";
        } else if (totalScore >= 15) {
            status = "CONSIDER";
        } else {
            status = "REJECTED";
        }

        // --- Save/Update CandidateScore ---
        // Check if score exists to update, else create new
        Optional<CandidateScore> existing = candidateScoreRepository.findByCandidateAndJobPosting(candidate, jobPosting);

        CandidateScore scoreEntity = existing.orElse(new CandidateScore());
        scoreEntity.setCandidate(candidate);
        scoreEntity.setJobPosting(jobPosting);
        scoreEntity.setTotalScore(totalScore);
        scoreEntity.setStatus(status);
        scoreEntity.setScoredAt(LocalDateTime.now());

        candidateScoreRepository.save(scoreEntity);
    }
}
