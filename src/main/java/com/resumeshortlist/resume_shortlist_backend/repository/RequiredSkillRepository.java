package com.resumeshortlist.resume_shortlist_backend.repository;

import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import com.resumeshortlist.resume_shortlist_backend.entity.RequiredSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequiredSkillRepository extends JpaRepository<RequiredSkill, Long> {
    List<RequiredSkill> findByJobPosting(JobPosting jobPosting);
    List<RequiredSkill> findByJobPostingId(Long jobPostingId);
    List<RequiredSkill> findByCategory(String category);
}