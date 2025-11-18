package com.resumeshortlist.resume_shortlist_backend.controller;

import com.resumeshortlist.resume_shortlist_backend.entity.Resume;
import com.resumeshortlist.resume_shortlist_backend.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/upload")
//@CrossOrigin
@RequiredArgsConstructor
public class ResumeController {

    private final FileUploadService FileUploadService;

    // 🎯 API #7 Upload Multiple Resumes
    @PostMapping("/{userId}")
    public ResponseEntity<?> uploadResumes(
            @PathVariable Long userId,
            @RequestPart("files") MultipartFile[] files) {
        try {
            List<Resume> saved = FileUploadService.uploadMultipleResumes(userId, files);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // 🎯 API #8 Get All Resumes Uploaded by Specific User
    @GetMapping("/{userId}")
    public ResponseEntity<List<Resume>> getResumesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(FileUploadService.getAllResumesByUser(userId));
    }
}
