// ScoringController.java (Existing controller with minor enhancements for better error handling and auth support)
// Note: Assuming Spring Security is configured for JWT auth; if not, add @PreAuthorize or similar.
// No changes needed for type mismatches as totalScore is already Integer in CandidateScore entity.

package com.resumeshortlist.resume_shortlist_backend.controller;

import com.resumeshortlist.resume_shortlist_backend.dto.DashboardResponse;
import com.resumeshortlist.resume_shortlist_backend.entity.CandidateScore;
import com.resumeshortlist.resume_shortlist_backend.repository.CandidateScoreRepository;
import com.resumeshortlist.resume_shortlist_backend.service.ScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")

@RestController
@RequestMapping("/api")
public class ScoringController {

    private final ScoringService scoringService;
    private final CandidateScoreRepository scoreRepo;

    public ScoringController(ScoringService scoringService,
                             CandidateScoreRepository scoreRepo) {
        this.scoringService = scoringService;
        this.scoreRepo = scoreRepo;
    }

    // 1. Trigger Scoring (Existing endpoint - no changes needed, but added better response handling)
    @PostMapping("/score/{jobId}")
    public ResponseEntity<?> triggerScoring(@PathVariable Long jobId) {
        try {
            scoringService.triggerScoring(jobId);
            return ResponseEntity.accepted().body(Map.of(
                    "message", "Scoring started in background",
                    "jobId", jobId,
                    "startedAt", java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to trigger scoring: " + e.getMessage()
            ));
        }
    }

    // 2. Dashboard (Existing - no changes)
    @GetMapping("/dashboard/{jobId}")
    public ResponseEntity<List<DashboardResponse>> getDashboard(@PathVariable Long jobId) {
        var scores = scoreRepo.findByJobPostingIdOrderByTotalScoreDesc(jobId);

        List<DashboardResponse> response = new ArrayList<>();
        int rank = 1;
        for (var s : scores) {
            var c = s.getCandidate();
            var r = c.getResume();
            response.add(new DashboardResponse(
                    c.getId(),
                    c.getName(),
                    c.getEmail(),
                    r.getFileName(),
                    s.getTotalScore(),
                    rank++,
                    s.getStatus(),
                    s.getScoredAt()
            ));
        }
        return ResponseEntity.ok(response);
    }
}