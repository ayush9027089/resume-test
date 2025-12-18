package com.resumeshortlist.resume_shortlist_backend.service;

import com.resumeshortlist.resume_shortlist_backend.entity.CandidateScore;
import com.resumeshortlist.resume_shortlist_backend.repository.CandidateScoreRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class CandidateScoringService {


    @Autowired
    private CandidateScoreRepository candidateScoreRepository;

    public ByteArrayInputStream generateTop10Pdf(Long jobId) {

        // Fetch Top 10 Scores for jobId
        List<CandidateScore> scores =
                candidateScoreRepository.findByJobPostingIdOrderByTotalScoreDesc(jobId)
                        .stream()
                        .limit(10)
                        .toList();

        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Top 10 Candidates Report"));
            document.add(new Paragraph("Job ID: " + jobId));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.addCell("Candidate Name");
            table.addCell("Score");
            table.addCell("Status");

            for (CandidateScore cs : scores) {
                table.addCell(cs.getCandidate().getName());
                table.addCell(String.valueOf(cs.getTotalScore()));
                table.addCell(cs.getStatus());
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
    // ✅ New service method for count
    public Long getCandidateCount(Long jobId) {
        if (jobId == null || jobId <= 0) {
            return 0L; // invalid jobId ke liye 0 return kare
        }
        return candidateScoreRepository.countByJobPostingId(jobId);
    }

    // ✅ Generate CSV for shortlisted candidates
    public String generateShortlistedCsv(Long jobId) {

        List<CandidateScore> scores = candidateScoreRepository.findTop10ByJobPostingIdOrderByTotalScoreDesc(jobId)
                .stream()
                .filter(cs -> "Selected".equalsIgnoreCase(cs.getStatus())) // sirf shortlisted
                .toList();

        if (scores.isEmpty()) {
            return "No shortlisted candidates found for Job ID: " + jobId;
        }

        // CSV header
        StringBuilder sb = new StringBuilder();
        sb.append("Candidate Name,Email,Total Score,Status\n");

        // CSV rows
        for (CandidateScore cs : scores) {
            sb.append(cs.getCandidate().getName()).append(",");
            sb.append(cs.getCandidate().getEmail()).append(",");
            sb.append(cs.getTotalScore()).append(",");
            sb.append(cs.getStatus()).append("\n");
        }

        return sb.toString();
    }
}