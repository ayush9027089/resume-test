package com.resumeshortlist.resume_shortlist_backend.repository;

import com.resumeshortlist.resume_shortlist_backend.entity.Candidate;
import com.resumeshortlist.resume_shortlist_backend.entity.CandidateScore;
import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateScoreRepository extends JpaRepository<CandidateScore, Long> {
    List<CandidateScore> findByCandidate(Candidate candidate);
    List<CandidateScore> findByJobPosting(JobPosting jobPosting);
    List<CandidateScore> findByJobPostingId(Long jobPostingId);

    // --- CRITICAL FOR SCORING SERVICE ---
    // Used to check if a score already exists so we update it instead of creating duplicates
    Optional<CandidateScore> findByCandidateAndJobPosting(Candidate candidate, JobPosting jobPosting);

    // --- Dashboard & Ranking ---
    // Returns all scores for a job, sorted by highest score first
    List<CandidateScore> findByJobPostingIdOrderByTotalScoreDesc(Long jobPostingId);

    // Returns exactly the top 10 candidates (Spring Data "Magic Method" - no SQL needed)
    List<CandidateScore> findTop10ByJobPostingIdOrderByTotalScoreDesc(Long jobPostingId);

    // --- Custom Queries ---

    // Updated minScore to INTEGER (was Float)
    @Query("SELECT cs FROM CandidateScore cs WHERE cs.jobPosting.id = :jobId AND cs.totalScore >= :minScore ORDER BY cs.totalScore DESC")
    List<CandidateScore> findShortlistedByJobIdAndMinScore(@Param("jobId") Long jobId, @Param("minScore") Integer minScore);

    // Count candidates scored for a specific job
    @Query("SELECT COUNT(cs) FROM CandidateScore cs WHERE cs.jobPosting.id = :jobId")
    Long countByJobPostingId(@Param("jobId") Long jobId);

    // (Optional) If you still need Pageable support for custom pagination
    @Query("SELECT cs FROM CandidateScore cs WHERE cs.jobPosting.id = :jobId ORDER BY cs.totalScore DESC")
    List<CandidateScore> findByJobPostingIdWithPagination(@Param("jobId") Long jobId, Pageable pageable);
}


