package com.resumeshortlist.resume_shortlist_backend.repository;

import com.resumeshortlist.resume_shortlist_backend.entity.Candidate;
import com.resumeshortlist.resume_shortlist_backend.entity.CandidateScore;
import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateScoreRepository extends JpaRepository<CandidateScore, Long> {
    List<CandidateScore> findByCandidate(Candidate candidate);
    List<CandidateScore> findByJobPosting(JobPosting jobPosting);
    List<CandidateScore> findByJobPostingId(Long jobPostingId);
    List<CandidateScore> findByJobPostingIdOrderByTotalScoreDesc(Long jobPostingId);

    @Query("SELECT cs FROM CandidateScore cs WHERE cs.jobPosting.id = :jobId AND cs.totalScore >= :minScore")
    List<CandidateScore> findShortlistedByJobIdAndMinScore(Long jobId, Float minScore);
}