package com.resumeshortlist.resume_shortlist_backend.controller;

import com.resumeshortlist.resume_shortlist_backend.entity.Resume;
import com.resumeshortlist.resume_shortlist_backend.service.FileUploadService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import com.resumeshortlist.resume_shortlist_backend.service.ResumeParsingService;


@RestController
@RequestMapping("/api/resumes")
//@CrossOrigin
@RequiredArgsConstructor
public class ResumeController {

    private final FileUploadService FileUploadService;
    @Autowired
    private ResumeParsingService resumeParsingService;

    // 🎯 API #7 Upload Multiple Resumes
    @PostMapping("/upload/{userId}")
    public ResponseEntity<?> uploadResumes(
            @PathVariable Long userId,
            @RequestPart("files") MultipartFile[] files) {
        try {
            List<Resume> saved = FileUploadService.uploadMultipleResumes(userId, files);

            // After upload, trigger Gemini-based parsing & extraction for each resume.
            for (Resume r : saved) {
                try {
                    resumeParsingService.parseAndSaveResume(r.getId());
                } catch (Exception ex) {
                    // Do not fail the whole upload if parsing a single resume fails.
                    // You can log this in a real application.
                }
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // 🎯 API #8 Get All Resumes Uploaded by Specific User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getResumesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(FileUploadService.getAllResumesByUser(userId));
    }

    @PostMapping("/parse/{resumeId}")
    public ResponseEntity<?> parseResume(@PathVariable Long resumeId) {
        try {
            resumeParsingService.parseAndSaveResume(resumeId);
            return ResponseEntity.ok("Resume parsed and data extracted successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Parsing failed: " + e.getMessage());
        }
    }
}
