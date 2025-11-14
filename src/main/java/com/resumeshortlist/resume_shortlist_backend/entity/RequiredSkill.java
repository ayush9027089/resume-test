package com.resumeshortlist.resume_shortlist_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "required_skills")
@Data
@NoArgsConstructor
public class RequiredSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String skillName;

    private String category; // e.g., "TECHNICAL", "SOFT", "TOOL"

    private Boolean isRequired;

    private Integer weight; // 1-10

    @ManyToOne
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;
}
