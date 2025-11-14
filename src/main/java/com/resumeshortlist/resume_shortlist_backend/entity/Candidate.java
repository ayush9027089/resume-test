package com.resumeshortlist.resume_shortlist_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String linkedinUrl;

    private String githubUrl;

    private String portfolioUrl;

    @OneToOne
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    private LocalDateTime extractedAt;
}
