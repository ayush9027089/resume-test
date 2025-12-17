package com.resumeshortlist.resume_shortlist_backend.repository;

import com.resumeshortlist.resume_shortlist_backend.entity.Candidate;
import com.resumeshortlist.resume_shortlist_backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByResume(Resume resume);

    Optional<Candidate> findByEmail(String email);

    List<Candidate> findByNameContainingIgnoreCase(String name);

    @Query(
            value = "SELECT c.* FROM candidates c " +
                    "JOIN resumes r ON c.resume_id = r.id " +
                    "JOIN job_applications ja ON r.id = ja.resume_id " +
                    "WHERE ja.job_id = :jobId",
            nativeQuery = true
    )
    List<Candidate> findByJobId(@Param("jobId") Long jobId);
}