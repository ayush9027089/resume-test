package com.resumeshortlist.resume_shortlist_backend.repository;

import com.resumeshortlist.resume_shortlist_backend.entity.Candidate;
import com.resumeshortlist.resume_shortlist_backend.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    List<WorkExperience> findByCandidate(Candidate candidate);
    List<WorkExperience> findByCandidateId(Long candidateId);
    List<WorkExperience> findByJobTitleContainingIgnoreCase(String jobTitle);
}