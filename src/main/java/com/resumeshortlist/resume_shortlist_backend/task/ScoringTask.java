package com.resumeshortlist.resume_shortlist_backend.task;

import com.resumeshortlist.resume_shortlist_backend.entity.CandidateScore;
import com.resumeshortlist.resume_shortlist_backend.entity.ExtractedSkill;
import com.resumeshortlist.resume_shortlist_backend.entity.RequiredSkill;
import com.resumeshortlist.resume_shortlist_backend.repository.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;


@Component
public class ScoringTask {
    private final CandidateRepository candidateRepo;
    private final RequiredSkillRepository reqRepo;
    private final ExtractedSkillRepository extRepo;
    private final CandidateScoreRepository scoreRepo;
    private final JobPostingRepository jobRepo;

    public ScoringTask(CandidateRepository candidateRepo,
                       RequiredSkillRepository reqRepo,
                       ExtractedSkillRepository extRepo,
                       CandidateScoreRepository scoreRepo,
                       JobPostingRepository jobRepo) {
        this.candidateRepo = candidateRepo;
        this.reqRepo = reqRepo;
        this.extRepo = extRepo;
        this.scoreRepo = scoreRepo;
        this.jobRepo = jobRepo;
    }

    @Async
    public void scoreCandidatesForJob(Long jobId) {
        var job = jobRepo.findById(jobId).orElse(null);
        if (job == null) return;

        var required = reqRepo.findByJobPostingId(jobId);
        var candidates = candidateRepo.findByJobId(jobId);

        for (var cand : candidates) {
            double total = 0.0;
            double max = required.stream().mapToDouble(RequiredSkill::getWeight).sum();

            for (var req : required) {
                double conf = extRepo.findByCandidateIdAndSkillName(cand.getId(), req.getSkillName())
                        .map(ExtractedSkill::getConfidenceScore)
                        .orElse(0.0F);
                total += req.getWeight() * conf;
            }

            double score = max > 0 ? (total / max) * 100 : 0;
            String status = score >= 80 ? "SHORTLISTED" : score >= 60 ? "CONSIDER" : "REJECTED";

            var cs = new CandidateScore();
            cs.setCandidate(cand);
            cs.setJobPosting(job);
            cs.setTotalScore((int)round(score, 2));
            cs.setStatus(status);
            cs.setScoredAt(LocalDateTime.now());
            scoreRepo.save(cs);
        }
    }

    private float round(double v, int p) {
        double m = Math.pow(10, p);
        return (float) (Math.round(v * m) / m);
    }
}