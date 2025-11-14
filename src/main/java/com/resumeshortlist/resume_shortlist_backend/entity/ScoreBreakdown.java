package com.resumeshortlist.resume_shortlist_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "score_breakdowns")
@Data
@NoArgsConstructor
public class ScoreBreakdown {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category; // e.g., "FORMAT", "CONTACT", etc.

    private Float earnedPoints;

    private Float maxPoints;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne
    @JoinColumn(name = "candidate_score_id", nullable = false)
    private CandidateScore candidateScore;
}
